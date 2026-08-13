import fs from "fs";
import path from "path";

const INDEX_FILE = "index.md";
const DEFAULT_SECTION = "Blocks";
const SUBPAGE_SECTION = "Pages";

const HEADING_REGEX = /^(#{1,6})\s+(.*)$/;
const LIST_LINK_REGEX = /^\s*-\s*\[\[([^\]]+)\]\]\s*$/;
const INLINE_WIKI_REGEX = /\[\[([^\]]+)\]\]/g;

// Atomically write a spine file: write to a unique temp path in the same
// directory then rename over the target, so a concurrent reader never observes a
// half-written index.md. Synchronous to match the index lock's sync critical
// section (spine writes always happen while the index lock is held).
function writeSpine(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, content, "utf-8");
  fs.renameSync(tmpPath, filePath);
}

// Strip a leading YAML frontmatter block (--- ... ---) if present.
export function stripFrontmatter(content) {
  const normalized = content.replace(/^﻿/, "");
  if (/^---\r?\n/.test(normalized)) {
    const lines = normalized.split("\n");
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].replace(/\r$/, "").trim() === "---") {
        return lines.slice(i + 1).join("\n").replace(/^\r?\n+/, "");
      }
    }
  }
  return content;
}

// Ensure the page folder and its spine (index.md) exist. `page` may be a
// multi-segment path (e.g. "form-engine/realtime"); the whole chain of folders
// is created. The spine title uses only the last segment (`# realtime`), not the
// full path. Returns the spine path.
export function ensureSpine(folder, page) {
  const pageDir = path.join(folder, page);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  const indexPath = path.join(pageDir, INDEX_FILE);
  if (!fs.existsSync(indexPath)) {
    const title = path.basename(page);
    writeSpine(indexPath, `# ${title}\n`);
  }
  return indexPath;
}

// Auto-link the ancestor chain of a (possibly multi-segment) target page so the
// tree is navigable top-down. For target "a/b/c" this ensures a/index.md links
// `- [[b]]` and a/b/index.md links `- [[c]]` (each under a "Pages" section),
// creating any missing ancestor index.md with a `# <name>` title. The leaf
// (a/b/c) spine itself is NOT touched here — the caller links its blocks. All
// links are idempotent, so repeated moves never duplicate a sub-page link.
export function ensureParentChain(folder, targetPage) {
  const segments = (targetPage || "").split("/").filter(s => s.length > 0);
  for (let i = 0; i < segments.length - 1; i++) {
    const ancestor = segments.slice(0, i + 1).join("/");
    const child = segments[i + 1];
    const spinePath = ensureSpine(folder, ancestor);
    addLinkToSpine(spinePath, child, SUBPAGE_SECTION);
  }
}

// Append `- [[<slug>]]` under the given section heading in the spine. Creates
// the heading when absent; when no section is given, uses a default trailing
// section. `slug` is the block slug without the .md extension.
export function addLinkToSpine(indexPath, slug, section) {
  const sectionName = section && section.trim() ? section.trim() : DEFAULT_SECTION;
  const content = fs.readFileSync(indexPath, "utf-8");
  const lines = content.split("\n");
  const linkLine = `- [[${slug}]]`;
  const wantedSlug = slug.replace(/\.md$/, "");

  // Idempotent: if the slug is already linked anywhere in this spine, do nothing.
  const already = lines.some(line => {
    const m = line.match(LIST_LINK_REGEX);
    return m && m[1].trim().replace(/\.md$/, "") === wantedSlug;
  });
  if (already) return;

  let headingIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(HEADING_REGEX);
    if (m && m[2].trim().toLowerCase() === sectionName.toLowerCase()) {
      headingIdx = i;
      break;
    }
  }

  if (headingIdx === -1) {
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    lines.push("");
    lines.push(`## ${sectionName}`);
    lines.push("");
    lines.push(linkLine);
    lines.push("");
  } else {
    let end = lines.length;
    for (let i = headingIdx + 1; i < lines.length; i++) {
      if (HEADING_REGEX.test(lines[i])) {
        end = i;
        break;
      }
    }
    let insertAt = end;
    while (insertAt > headingIdx + 1 && lines[insertAt - 1].trim() === "") insertAt--;
    lines.splice(insertAt, 0, linkLine);
  }

  writeSpine(indexPath, lines.join("\n"));
}

// Remove the `- [[<slug>]]` line from a spine if present. Matches with or
// without a trailing .md on the slug. No-op when the spine or line is absent.
export function removeLinkFromSpine(indexPath, slug) {
  if (!fs.existsSync(indexPath)) return;
  const content = fs.readFileSync(indexPath, "utf-8");
  const lines = content.split("\n");
  const target = slug.replace(/\.md$/, "");
  const filtered = lines.filter(line => {
    const m = line.match(LIST_LINK_REGEX);
    if (!m) return true;
    return m[1].trim().replace(/\.md$/, "") !== target;
  });
  if (filtered.length !== lines.length) {
    writeSpine(indexPath, filtered.join("\n"));
  }
}

// Assemble a human-readable page from its spine. `page` may be multi-segment
// (e.g. "form-engine/realtime"). For each `- [[X]]` link in the spine:
//   - if X resolves to a block file (<page>/X.md) → inline the block body
//     (frontmatter stripped), producing a readable leaf document;
//   - if X resolves to a sub-page folder (<page>/X/ with its own index.md) →
//     render a single navigation line `- **X** — <overview>` and do NOT recurse
//     into the sub-tree, so a parent page stays a navigable index.
// The spine's own headings and prose are preserved verbatim.
export function assemblePage(folder, page) {
  const pageDir = path.join(folder, page);
  if (!fs.existsSync(pageDir) || !fs.statSync(pageDir).isDirectory()) {
    throw new Error(`Page not found: ${page}`);
  }
  const indexPath = path.join(pageDir, INDEX_FILE);
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Page spine not found: ${page}/${INDEX_FILE}`);
  }

  const spine = fs.readFileSync(indexPath, "utf-8");
  const lines = spine.split("\n");
  const out = [];

  for (const line of lines) {
    const listMatch = line.match(LIST_LINK_REGEX);
    if (listMatch) {
      out.push(renderLink(pageDir, page, listMatch[1].trim()));
      continue;
    }

    INLINE_WIKI_REGEX.lastIndex = 0;
    if (INLINE_WIKI_REGEX.test(line)) {
      out.push(line.replace(INLINE_WIKI_REGEX, (_, slug) => readBlockBody(pageDir, page, slug.trim())));
      continue;
    }

    out.push(line);
  }

  return out.join("\n").replace(/\n+$/, "");
}

// Resolve a `- [[X]]` spine link: inline a block body, or render a sub-page
// navigation line. Errors if X is neither a block nor a sub-page.
function renderLink(pageDir, page, slug) {
  const bare = slug.replace(/\.md$/, "");
  const blockPath = path.join(pageDir, `${bare}.md`);
  const subPageDir = path.join(pageDir, bare);
  const subPageIndex = path.join(subPageDir, INDEX_FILE);

  if (fs.existsSync(blockPath) && fs.statSync(blockPath).isFile()) {
    return readBlockBody(pageDir, page, slug);
  }

  if (fs.existsSync(subPageIndex)) {
    const overview = subPageOverview(subPageIndex);
    return overview ? `- **${bare}** — ${overview}` : `- **${bare}**`;
  }

  throw new Error(`Block not found: ${bare} (referenced in page ${page})`);
}

// First line of prose in a sub-page's index.md: the first non-empty line that is
// neither a heading nor a `- [[link]]` list item. Returns "" when the index has
// only a title and links (no overview paragraph).
export function subPageOverview(subPageIndex) {
  const content = stripFrontmatter(fs.readFileSync(subPageIndex, "utf-8"));
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (line === "") continue;
    if (HEADING_REGEX.test(line)) continue;
    if (LIST_LINK_REGEX.test(raw)) continue;
    return line;
  }
  return "";
}

function readBlockBody(pageDir, page, slug) {
  const filename = slug.endsWith(".md") ? slug : `${slug}.md`;
  const blockPath = path.join(pageDir, filename);
  if (!fs.existsSync(blockPath)) {
    throw new Error(`Block not found: ${slug} (referenced in page ${page})`);
  }
  return stripFrontmatter(fs.readFileSync(blockPath, "utf-8")).replace(/\s+$/, "");
}
