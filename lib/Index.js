import fs from "fs";
import path from "path";

const INDEX_FILE = "index.json";
const LOCK_FILE = "index.json.lock";

// How long to wait for a lock before giving up, and how long before a lock is
// considered stale (a process crashed without releasing it).
const LOCK_TIMEOUT_MS = 10000;
const LOCK_STALE_MS = 30000;
const LOCK_RETRY_MS = 25;

function sleep(ms) {
  // Tiny synchronous sleep so the whole read-modify-write can stay synchronous.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Absolute path to a folder's index.json (root-relative entries live under it).
export function indexPath(folder) {
  return path.join(folder, INDEX_FILE);
}

export function readIndex(folder) {
  const file = indexPath(folder);
  if (!fs.existsSync(file)) {
    return [];
  }

  const content = fs.readFileSync(file, "utf-8");
  return JSON.parse(content);
}

export function writeIndex(folder, entries) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  // Write to a temp file then rename so a concurrent reader never sees a
  // half-written index.json (rename is atomic on the same filesystem).
  const file = indexPath(folder);
  const tmpPath = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(entries, null, 2), "utf-8");
  fs.renameSync(tmpPath, file);
}

// Acquire a cross-process advisory lock on index.json by exclusively creating a
// lock file (O_EXCL). On contention, retry with a small backoff up to a
// timeout. Stale locks (from a crashed process) are reclaimed.
function acquireLock(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const lockPath = path.join(folder, LOCK_FILE);
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  for (;;) {
    try {
      const fd = fs.openSync(lockPath, "wx");
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd);
      return lockPath;
    } catch (e) {
      if (e.code !== "EEXIST") {
        throw e;
      }

      // Lock is held. Reclaim it if it looks stale.
      try {
        const stat = fs.statSync(lockPath);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          fs.rmSync(lockPath, { force: true });
          continue;
        }
      } catch (statErr) {
        // Lock vanished between EEXIST and stat — just retry immediately.
        if (statErr.code === "ENOENT") {
          continue;
        }
        throw statErr;
      }

      if (Date.now() >= deadline) {
        throw new Error(`Timed out acquiring index lock: ${lockPath}`);
      }
      sleep(LOCK_RETRY_MS);
    }
  }
}

function releaseLock(lockPath) {
  try {
    fs.rmSync(lockPath, { force: true });
  } catch (e) {
    // Best-effort release; never let cleanup failure mask the real result.
  }
}

// Run fn while holding the index lock. fn receives nothing; it is expected to
// re-read the index inside the critical section so it always operates on the
// latest on-disk state. The lock is always released, even on error.
export function withIndexLock(folder, fn) {
  const lockPath = acquireLock(folder);
  try {
    return fn();
  } finally {
    releaseLock(lockPath);
  }
}

export function addIndexEntry(folder, entry) {
  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    entries.push(entry);
    writeIndex(folder, entries);
  });
}

export function removeIndexEntry(folder, topic) {
  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    const filtered = entries.filter(e => e.topic.toLowerCase() !== topic.toLowerCase());
    writeIndex(folder, filtered);
  });
}

export function updateIndexEntry(folder, topic, updates) {
  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    const idx = entries.findIndex(e => e.topic.toLowerCase() === topic.toLowerCase());
    if (idx === -1) {
      throw new Error(`Entry not found: ${topic}`);
    }
    entries[idx] = { ...entries[idx], ...updates };
    writeIndex(folder, entries);
  });
}

export function findIndexEntry(folder, topic) {
  const entries = readIndex(folder);
  return entries.find(e => e.topic.toLowerCase() === topic.toLowerCase()) || null;
}

export function findIndexEntryByFile(folder, file) {
  const entries = readIndex(folder);
  return entries.find(e => e.file === file) || null;
}
