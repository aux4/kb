import fs from "fs";
import path from "path";
import { walkEntries } from "./Walk.js";

const MD_LINK_REGEX = /\[([^\]]*)\]\(([^)]+\.md)\)/g;
const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

// Extract both markdown links `[text](file.md)` and wiki links `[[slug]]`.
// Wiki-link targets are returned as `<slug>.md` with wiki=true so the caller
// can resolve them relative to the block's page.
export function extractLinks(content) {
  const links = [];
  let match;

  MD_LINK_REGEX.lastIndex = 0;
  while ((match = MD_LINK_REGEX.exec(content)) !== null) {
    links.push({ text: match[1], target: match[2], wiki: false });
  }

  WIKI_LINK_REGEX.lastIndex = 0;
  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    const slug = match[1].trim();
    if (slug === "") continue;
    const target = slug.endsWith(".md") ? slug : `${slug}.md`;
    links.push({ text: slug, target, wiki: true });
  }

  return links;
}

// Resolve a link target to a root-relative path. Wiki links inside a page block
// resolve to `<page>/<slug>.md`; markdown links are kept as authored (they are
// already root-relative in the flat model).
export function resolveTarget(link, page) {
  if (link.wiki && page) {
    return `${page}/${link.target}`;
  }
  return link.target;
}

export function buildGraph(folder) {
  if (!fs.existsSync(folder)) {
    return { nodes: [], edges: [] };
  }

  const entries = walkEntries(folder);
  const files = entries.map(e => e.file);
  const edges = [];

  for (const { file, page } of entries) {
    const filePath = path.join(folder, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const links = extractLinks(content);

    for (const link of links) {
      edges.push({
        from: file,
        to: resolveTarget(link, page),
        text: link.text
      });
    }
  }

  const allTargets = new Set(edges.map(e => e.to));
  const allFiles = new Set(files);
  const nodes = files.map(file => ({
    file,
    exists: true,
    outbound: edges.filter(e => e.from === file).length,
    inbound: edges.filter(e => e.to === file).length
  }));

  for (const target of allTargets) {
    if (!allFiles.has(target)) {
      nodes.push({
        file: target,
        exists: false,
        outbound: 0,
        inbound: edges.filter(e => e.to === target).length
      });
    }
  }

  return { nodes, edges };
}

export function linksFrom(folder, file) {
  const { edges } = buildGraph(folder);
  return edges.filter(e => e.from === file);
}

export function linksTo(folder, file) {
  const { edges } = buildGraph(folder);
  return edges.filter(e => e.to === file);
}

export function orphanPages(folder) {
  const { nodes } = buildGraph(folder);
  return nodes.filter(n => n.exists && n.inbound === 0);
}

export function missingPages(folder) {
  const { nodes } = buildGraph(folder);
  return nodes.filter(n => !n.exists);
}
