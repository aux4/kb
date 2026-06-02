import fs from "fs";
import path from "path";

const LINK_REGEX = /\[([^\]]*)\]\(([^)]+\.md)\)/g;

export function extractLinks(content) {
  const links = [];
  let match;
  while ((match = LINK_REGEX.exec(content)) !== null) {
    links.push({
      text: match[1],
      target: match[2]
    });
  }
  return links;
}

export function buildGraph(folder) {
  if (!fs.existsSync(folder)) {
    return { nodes: [], edges: [] };
  }

  const files = fs.readdirSync(folder).filter(f => f.endsWith(".md"));
  const edges = [];

  for (const file of files) {
    const filePath = path.join(folder, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const links = extractLinks(content);

    for (const link of links) {
      edges.push({
        from: file,
        to: link.target,
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
