import fs from "fs";
import path from "path";

const INDEX_FILE = "index.json";

export function readIndex(folder) {
  const indexPath = path.join(folder, INDEX_FILE);
  if (!fs.existsSync(indexPath)) {
    return [];
  }

  const content = fs.readFileSync(indexPath, "utf-8");
  return JSON.parse(content);
}

export function writeIndex(folder, entries) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  fs.writeFileSync(path.join(folder, INDEX_FILE), JSON.stringify(entries, null, 2), "utf-8");
}

export function addIndexEntry(folder, entry) {
  const entries = readIndex(folder);
  entries.push(entry);
  writeIndex(folder, entries);
}

export function removeIndexEntry(folder, topic) {
  const entries = readIndex(folder);
  const filtered = entries.filter(e => e.topic.toLowerCase() !== topic.toLowerCase());
  writeIndex(folder, filtered);
}

export function updateIndexEntry(folder, topic, updates) {
  const entries = readIndex(folder);
  const idx = entries.findIndex(e => e.topic.toLowerCase() === topic.toLowerCase());
  if (idx === -1) {
    throw new Error(`Entry not found: ${topic}`);
  }
  entries[idx] = { ...entries[idx], ...updates };
  writeIndex(folder, entries);
}

export function findIndexEntry(folder, topic) {
  const entries = readIndex(folder);
  return entries.find(e => e.topic.toLowerCase() === topic.toLowerCase()) || null;
}

export function findIndexEntryByFile(folder, file) {
  const entries = readIndex(folder);
  return entries.find(e => e.file === file) || null;
}
