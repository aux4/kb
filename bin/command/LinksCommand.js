import { slugify } from "../../lib/Slug.js";
import { buildGraph, linksFrom, linksTo, orphanPages, missingPages } from "../../lib/Links.js";

function formatText(data) {
  if (data.type === "orphans") {
    if (data.pages.length === 0) return "No orphan pages found.";
    return "Orphan pages (no inbound links):\n" +
      data.pages.map(p => `  ${p.file}`).join("\n");
  }

  if (data.type === "missing") {
    if (data.pages.length === 0) return "No missing pages found.";
    return "Missing pages (linked but do not exist):\n" +
      data.pages.map(p => `  ${p.file} (${p.inbound} inbound link${p.inbound > 1 ? "s" : ""})`).join("\n");
  }

  if (data.type === "from") {
    if (data.links.length === 0) return `No outbound links from ${data.file}`;
    return `Outbound links from ${data.file}:\n` +
      data.links.map(l => `  → ${l.to} (${l.text})`).join("\n");
  }

  if (data.type === "to") {
    if (data.links.length === 0) return `No inbound links to ${data.file}`;
    return `Inbound links to ${data.file}:\n` +
      data.links.map(l => `  ← ${l.from} (${l.text})`).join("\n");
  }

  if (data.type === "graph") {
    if (data.edges.length === 0) return "No links found in knowledge base.";
    const existing = data.nodes.filter(n => n.exists).sort((a, b) => b.inbound - a.inbound);
    const miss = data.nodes.filter(n => !n.exists);

    let out = `Graph: ${existing.length} pages, ${data.edges.length} links\n\n`;
    out += existing.map(n => `  ${n.file}  ← ${n.inbound} in  → ${n.outbound} out`).join("\n");

    if (miss.length > 0) {
      out += "\n\nMissing pages:\n";
      out += miss.map(m => `  ${m.file} (${m.inbound} inbound)`).join("\n");
    }
    return out;
  }

  return JSON.stringify(data);
}

export default async function linksCommand(params) {
  const [folder, from, to, orphans, missing, render] = params;
  const dir = folder || ".knowledge";
  const useJson = render === "json";

  let result;

  if (orphans === "true") {
    const pages = orphanPages(dir);
    result = { type: "orphans", pages: pages.map(p => ({ file: p.file, outbound: p.outbound })) };
  } else if (missing === "true") {
    const pages = missingPages(dir);
    result = { type: "missing", pages: pages.map(p => ({ file: p.file, inbound: p.inbound })) };
  } else if (from) {
    const file = from.endsWith(".md") ? from : slugify(from);
    const links = linksFrom(dir, file);
    result = { type: "from", file, links };
  } else if (to) {
    const file = to.endsWith(".md") ? to : slugify(to);
    const links = linksTo(dir, file);
    result = { type: "to", file, links };
  } else {
    const { nodes, edges } = buildGraph(dir);
    result = { type: "graph", nodes, edges };
  }

  if (useJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatText(result));
  }
}
