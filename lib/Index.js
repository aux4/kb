import fs from "fs";
import path from "path";

const HEADER = "# Knowledge Base\n\n| Topic | File | Tags | Date | Summary |\n|-------|------|------|------|---------|";

export function readIndex(folder) {
  const indexPath = path.join(folder, "index.md");
  if (!fs.existsSync(indexPath)) {
    return [];
  }

  const content = fs.readFileSync(indexPath, "utf-8");
  const lines = content.split("\n");
  const entries = [];

  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const cols = line.split("|").map(c => c.trim()).filter(c => c !== "");
    if (cols.length < 4) continue;
    if (cols[0] === "Topic" || cols[0].startsWith("-")) continue;

    entries.push({
      topic: cols[0],
      file: cols[1],
      tags: cols[2],
      date: cols[3],
      summary: cols[4] || ""
    });
  }

  return entries;
}

export function writeIndex(folder, entries) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const rows = entries.map(e =>
    `| ${e.topic} | ${e.file} | ${e.tags} | ${e.date} | ${e.summary} |`
  );

  const content = HEADER + "\n" + rows.join("\n") + "\n";
  fs.writeFileSync(path.join(folder, "index.md"), content, "utf-8");
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
