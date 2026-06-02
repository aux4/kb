import fs from "fs";
import path from "path";
import { slugify } from "./Slug.js";
import { addIndexEntry, removeIndexEntry, updateIndexEntry, findIndexEntry } from "./Index.js";
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

  const existing = findIndexEntry(folder, topic);
  if (existing) {
    throw new Error(`Entry already exists: ${topic}`);
  }

  const filename = slugify(topic);
  const filePath = path.join(folder, filename);
  fs.writeFileSync(filePath, content, "utf-8");

  const refs = extractReferences(content);
  addIndexEntry(folder, {
    topic,
    file: filename,
    tags: tags || "",
    date: todayDate(),
    summary: extractSummary(content),
    md5: computeMd5(content),
    references: refs
  });
}

export function updateEntryContent(folder, topic, content) {
  const entry = findIndexEntry(folder, topic);
  if (!entry) {
    throw new Error(`Entry not found: ${topic}`);
  }

  const filePath = path.join(folder, entry.file);
  fs.writeFileSync(filePath, content, "utf-8");

  const refs = extractReferences(content);
  updateIndexEntry(folder, topic, {
    date: todayDate(),
    summary: extractSummary(content),
    md5: computeMd5(content),
    references: refs
  });
}

export function removeEntry(folder, topic) {
  const entry = findIndexEntry(folder, topic);
  if (!entry) {
    throw new Error(`Entry not found: ${topic}`);
  }

  const filePath = path.join(folder, entry.file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  removeIndexEntry(folder, topic);
  removeReferencesToFile(folder, entry.file);
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
