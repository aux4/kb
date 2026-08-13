import crypto from "crypto";
import fs from "fs";
import path from "path";
import { readIndex, writeIndex } from "./Index.js";
import { extractLinks, resolveTarget } from "./Links.js";

export function computeMd5(content) {
  return crypto.createHash("md5").update(content, "utf-8").digest("hex");
}

// Collect the outbound references of a block as root-relative paths. Markdown
// links `[text](file.md)` are kept as authored; `[[slug]]` wikilinks resolve
// against the block's page (`<page>/<slug>.md`) so nested blocks link correctly.
export function extractReferences(content, page = "") {
  const links = extractLinks(content);
  const refs = [...new Set(links.map(l => resolveTarget(l, page)))];
  return refs.sort();
}

export function removeReferencesToFile(folder, deletedFile) {
  const entries = readIndex(folder);
  let changed = false;

  for (const entry of entries) {
    const refs = entry.references || [];
    if (refs.includes(deletedFile)) {
      const filePath = path.join(folder, entry.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf-8");
        const linkRegex = new RegExp(`\\[([^\\]]*)\\]\\(${escapeRegex(deletedFile)}\\)`, "g");
        content = content.replace(linkRegex, "$1");
        fs.writeFileSync(filePath, content, "utf-8");

        entry.references = extractReferences(content);
        entry.md5 = computeMd5(content);
        changed = true;
      }
    }
  }

  if (changed) {
    writeIndex(folder, entries);
  }
}

export function updateReferencesOnPathChange(folder, oldFile, newFile) {
  const entries = readIndex(folder);
  let changed = false;

  for (const entry of entries) {
    const refs = entry.references || [];
    if (refs.includes(oldFile)) {
      const filePath = path.join(folder, entry.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf-8");
        const linkRegex = new RegExp(`\\(${escapeRegex(oldFile)}\\)`, "g");
        content = content.replace(linkRegex, `(${newFile})`);
        fs.writeFileSync(filePath, content, "utf-8");

        entry.references = extractReferences(content);
        entry.md5 = computeMd5(content);
        changed = true;
      }
    }
  }

  if (changed) {
    writeIndex(folder, entries);
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
