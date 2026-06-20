import fs from "fs";
import path from "path";
import { slugify } from "./Slug.js";
import { withIndexLock, readIndex, writeIndex, findIndexEntry } from "./Index.js";
import { computeMd5, extractReferences, removeReferencesToFile } from "./References.js";

export function extractSummary(content) {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (trimmed.startsWith("#")) continue;
    return trimmed.length > 100 ? trimmed.substring(0, 100) + "..." : trimmed;
  }
  return "";
}

function todayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createEntry(folder, topic, content, tags) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  // Hold the index lock across the entire read-check-write so two concurrent
  // `kb add` processes cannot both read a stale index and clobber each other's
  // entry (last-write-wins -> orphaned .md). The index is re-read inside the
  // lock so we always append to the latest on-disk state.
  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    if (entries.some(e => e.topic.toLowerCase() === topic.toLowerCase())) {
      throw new Error(`Entry already exists: ${topic}`);
    }

    const filename = slugify(topic);
    const filePath = path.join(folder, filename);
    fs.writeFileSync(filePath, content, "utf-8");

    const refs = extractReferences(content);
    entries.push({
      topic,
      file: filename,
      tags: tags || "",
      date: todayDate(),
      summary: extractSummary(content),
      md5: computeMd5(content),
      references: refs
    });
    writeIndex(folder, entries);
  });
}

export function updateEntryContent(folder, topic, content) {
  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    const idx = entries.findIndex(e => e.topic.toLowerCase() === topic.toLowerCase());
    if (idx === -1) {
      throw new Error(`Entry not found: ${topic}`);
    }

    const entry = entries[idx];
    const filePath = path.join(folder, entry.file);
    fs.writeFileSync(filePath, content, "utf-8");

    const refs = extractReferences(content);
    entries[idx] = {
      ...entry,
      date: todayDate(),
      summary: extractSummary(content),
      md5: computeMd5(content),
      references: refs
    };
    writeIndex(folder, entries);
  });
}

export function removeEntry(folder, topic) {
  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    const idx = entries.findIndex(e => e.topic.toLowerCase() === topic.toLowerCase());
    if (idx === -1) {
      throw new Error(`Entry not found: ${topic}`);
    }

    const entry = entries[idx];
    const filePath = path.join(folder, entry.file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const remaining = entries.filter((_, i) => i !== idx);
    writeIndex(folder, remaining);

    // Scrub links pointing at the removed file from other entries. This reads
    // and writes index.json again but is safe because we still hold the lock.
    removeReferencesToFile(folder, entry.file);
  });
}

export function readEntry(folder, topic) {
  const entry = findIndexEntry(folder, topic);
  if (!entry) {
    throw new Error(`Entry not found: ${topic}`);
  }

  const filePath = path.join(folder, entry.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Entry file not found: ${entry.file}`);
  }

  return fs.readFileSync(filePath, "utf-8");
}
