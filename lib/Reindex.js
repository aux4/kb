import fs from "fs";
import path from "path";
import { withIndexLock, readIndex, writeIndex } from "./Index.js";
import { walkEntries } from "./Walk.js";
import { computeMd5, extractReferences } from "./References.js";

// Derive the page (subfolder) name from a root-relative file path.
// "" for root-level files, otherwise the immediate parent folder.
function pageOfFile(file) {
  const dir = path.dirname(file);
  return dir === "." || dir === "" ? "" : dir;
}

// Reverse the Slug: strip `.md`, take the basename, split on `-`, join with
// spaces, and capitalize each word. Slugging is lossy (casing/punctuation are
// gone), so this is only a best-effort human-readable topic.
export function deslugify(file) {
  const base = path.basename(file).replace(/\.md$/, "");
  return base
    .split("-")
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// First ~160 chars of the body collapsed to a single line.
export function synthesizeSummary(content) {
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length > 160 ? oneLine.substring(0, 160) + "..." : oneLine;
}

function mtimeDate(filePath) {
  const d = fs.statSync(filePath).mtime;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Rebuild index.json to match what is on disk, non-destructively:
//   - existing entries whose file still exists are kept verbatim, but a missing
//     `page` field is backfilled from the file's folder;
//   - on-disk files not present in the index get a synthesized entry;
//   - index entries whose file no longer exists on disk are dropped.
// Runs entirely inside the shared index lock (main's withIndexLock), re-reading
// the index inside the critical section. Returns { kept, added: [topics], removedStale }.
export function reindexFolder(folder) {
  return withIndexLock(folder, () => {
    const existing = readIndex(folder);
    const onDisk = walkEntries(folder);
    const diskFiles = new Set(onDisk.map(e => e.file));
    const indexedFiles = new Set(existing.map(e => e.file));

    const rebuilt = [];
    const addedTopics = [];
    let kept = 0;
    let removedStale = 0;

    // Keep existing entries whose file still exists; drop the stale ones.
    for (const entry of existing) {
      if (!diskFiles.has(entry.file)) {
        removedStale++;
        continue;
      }
      const backfilled = { ...entry };
      if (backfilled.page === undefined || backfilled.page === null) {
        backfilled.page = pageOfFile(entry.file);
      }
      rebuilt.push(backfilled);
      kept++;
    }

    // Synthesize entries for on-disk files not covered by the index.
    for (const { file, page } of onDisk) {
      if (indexedFiles.has(file)) continue;
      const filePath = path.join(folder, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const topic = deslugify(file);
      rebuilt.push({
        topic,
        file,
        page,
        tags: "",
        date: mtimeDate(filePath),
        summary: synthesizeSummary(content),
        md5: computeMd5(content),
        references: extractReferences(content, page)
      });
      addedTopics.push(topic);
    }

    writeIndex(folder, rebuilt);

    return { kept, added: addedTopics, removedStale };
  });
}
