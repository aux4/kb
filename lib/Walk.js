import fs from "fs";
import path from "path";

const INDEX_FILE = "index.md";

// Walk a knowledge base folder collecting markdown block entries at ANY depth.
// A folder tree may nest arbitrarily: subject/subpage/subsubpage/.../blocks.md,
// with an index.md spine at every level.
//
// Returns an array of { file, page } where:
//   - file: full path relative to the root
//           (e.g. "flat.md", "aux4-mock/stub.md", "form-engine/realtime/late-joiner.md")
//   - page: the block's parent folder path relative to the root
//           ("" for flat/root entries, "form-engine/realtime" for a 2-deep block)
//
// Every index.md at every level is excluded by default because it is the
// page-spine metadata, not a searchable block. Pass { includeIndex: true } to
// include them. Hidden files and folders (leading ".") are skipped.
export function walkEntries(folder, options = {}) {
  if (!fs.existsSync(folder)) {
    return [];
  }

  const includeIndex = options.includeIndex === true;
  const results = [];

  function walk(dir, relPage) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith(".")) continue;
      if (item.isFile()) {
        if (!item.name.endsWith(".md")) continue;
        if (!includeIndex && item.name === INDEX_FILE) continue;
        const file = relPage ? `${relPage}/${item.name}` : item.name;
        results.push({ file, page: relPage });
      } else if (item.isDirectory()) {
        const childPage = relPage ? `${relPage}/${item.name}` : item.name;
        walk(path.join(dir, item.name), childPage);
      }
    }
  }

  walk(folder, "");
  return results;
}
