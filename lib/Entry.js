import fs from "fs";
import path from "path";
import { slugify } from "./Slug.js";
import { withIndexLock, readIndex, writeIndex, findIndexEntry } from "./Index.js";
import { computeMd5, extractReferences, removeReferencesToFile } from "./References.js";
import { ensureSpine, addLinkToSpine, removeLinkFromSpine, ensureParentChain } from "./Spine.js";

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

function pageOfFile(file) {
  const dir = path.dirname(file);
  return dir === "." || dir === "" ? "" : dir;
}

// Create a knowledge block. Without --page it stays a flat root entry (page "").
// With --page it is written under the page subfolder, the entry records the
// root-relative file + page, and the block is linked into the page spine
// (index.md) under --section (default "Blocks"); a multi-segment page
// (e.g. a/b/c) auto-links its whole ancestor chain so the tree is navigable.
//
// The entire read-check-write (index.json + block .md + page spine) is held
// under main's synchronous index lock so two concurrent `kb add` processes can
// never both read a stale index and clobber each other's entry. The index is
// re-read inside the lock so we always append to the latest on-disk state.
export function createEntry(folder, topic, content, tags, page, section) {
  const pageName = page || "";

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    if (entries.some(e => e.topic.toLowerCase() === topic.toLowerCase())) {
      throw new Error(`Entry already exists: ${topic}`);
    }

    const targetDir = pageName ? path.join(folder, pageName) : folder;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = slugify(topic);
    const relativeFile = pageName ? `${pageName}/${filename}` : filename;
    const filePath = path.join(folder, relativeFile);
    fs.writeFileSync(filePath, content, "utf-8");

    const refs = extractReferences(content, pageName);
    entries.push({
      topic,
      file: relativeFile,
      page: pageName,
      tags: tags || "",
      date: todayDate(),
      summary: extractSummary(content),
      md5: computeMd5(content),
      references: refs
    });
    writeIndex(folder, entries);

    if (pageName !== "") {
      const spinePath = ensureSpine(folder, pageName);
      const slug = filename.replace(/\.md$/, "");
      addLinkToSpine(spinePath, slug, section || "");
      // Link the ancestor chain when the page is multi-segment (a/b/c), so a
      // deep add self-assembles a navigable tree just like a deep move.
      ensureParentChain(folder, pageName);
    }
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

    const refs = extractReferences(content, entry.page || "");
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

    // If the block lived in a page, drop its spine link so `kb page` never tries
    // to inline a block that no longer exists.
    const page = entry.page !== undefined && entry.page !== null ? entry.page : pageOfFile(entry.file);
    if (page !== "") {
      const spinePath = path.join(folder, page, "index.md");
      const slug = path.basename(entry.file).replace(/\.md$/, "");
      removeLinkFromSpine(spinePath, slug);
    }

    // Scrub links pointing at the removed file from other entries. This reads
    // and writes index.json again but is safe because we still hold the lock.
    removeReferencesToFile(folder, entry.file);
  });
}

// Relocate an existing flat/root or page entry into a target page folder.
// Keeps the existing filename (slug); moves the .md via a synchronous rename;
// strips the old spine link when the entry was already in a source page; ensures
// the target spine and appends the block link under `section` (default "Blocks");
// auto-links the target's whole ancestor chain. Updates the index entry's
// page + file. All under main's synchronous index lock.
export function moveEntry(folder, topic, page, section) {
  const targetPage = (page || "").trim();
  if (targetPage === "") {
    throw new Error("Target page is required");
  }

  withIndexLock(folder, () => {
    const entries = readIndex(folder);
    const idx = entries.findIndex(e => e.topic.toLowerCase() === topic.toLowerCase());
    if (idx === -1) {
      throw new Error(`Entry not found: ${topic}`);
    }
    const entry = entries[idx];

    const basename = path.basename(entry.file);
    const oldFile = entry.file;
    const oldPage = entry.page !== undefined && entry.page !== null ? entry.page : pageOfFile(oldFile);
    const newFile = `${targetPage}/${basename}`;

    if (newFile === oldFile) {
      throw new Error(`Entry ${topic} is already in page: ${targetPage}`);
    }

    const oldPath = path.join(folder, oldFile);
    const newPath = path.join(folder, newFile);
    if (!fs.existsSync(oldPath)) {
      throw new Error(`Entry file not found: ${oldFile}`);
    }

    const pageDir = path.join(folder, targetPage);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    fs.renameSync(oldPath, newPath);

    const slug = basename.replace(/\.md$/, "");

    // Strip the link from the source page spine.
    if (oldPage !== "") {
      const oldSpine = path.join(folder, oldPage, "index.md");
      removeLinkFromSpine(oldSpine, slug);
    }

    // Ensure the target (leaf) spine and link the moved block into it.
    const spinePath = ensureSpine(folder, targetPage);
    addLinkToSpine(spinePath, slug, section || "");

    // Auto-link the whole ancestor chain (a/index.md -> [[b]], a/b -> [[c]], ...)
    // so a nested target self-assembles into a navigable tree.
    ensureParentChain(folder, targetPage);

    entries[idx] = { ...entry, page: targetPage, file: newFile };
    writeIndex(folder, entries);
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
