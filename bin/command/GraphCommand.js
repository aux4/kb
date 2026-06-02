import { findIndexEntry, readIndex } from "../../lib/Index.js";

function fileToId(file) {
  return file.replace(/\.md$/, "").replace(/[^a-zA-Z0-9]/g, "_");
}

function fileToLabel(file, entries) {
  const entry = entries.find(e => e.file === file);
  return entry ? entry.topic : file.replace(/\.md$/, "");
}

function buildMermaid(entries, filterFile) {
  const lines = ["graph LR"];
  const seen = new Set();

  const relevantEntries = filterFile
    ? entries.filter(e => {
        if (e.file === filterFile) return true;
        const refs = (e.references || []);
        if (refs.includes(filterFile)) return true;
        const filterEntry = entries.find(en => en.file === filterFile);
        if (filterEntry) {
          const filterRefs = filterEntry.references || [];
          if (filterRefs.includes(e.file)) return true;
        }
        return false;
      })
    : entries;

  for (const entry of relevantEntries) {
    const fromId = fileToId(entry.file);
    const fromLabel = entry.topic;

    if (!seen.has(fromId)) {
      lines.push(`  ${fromId}["${fromLabel}"]`);
      seen.add(fromId);
    }

    const refs = entry.references || [];
    for (const ref of refs) {
      const toId = fileToId(ref);
      const toLabel = fileToLabel(ref, entries);

      if (!seen.has(toId)) {
        const targetEntry = entries.find(e => e.file === ref);
        if (targetEntry) {
          lines.push(`  ${toId}["${toLabel}"]`);
        } else {
          lines.push(`  ${toId}["${toLabel}"]:::missing`);
        }
        seen.add(toId);
      }

      lines.push(`  ${fromId} --> ${toId}`);
    }
  }

  if (filterFile) {
    const id = fileToId(filterFile);
    lines.push(`  style ${id} fill:#f9f,stroke:#333,stroke-width:2px`);
  }

  lines.push("  classDef missing fill:#fdd,stroke:#c00,stroke-dasharray: 5 5");

  return lines.join("\n");
}

export default async function graphCommand(params) {
  const [folder, topic, render] = params;
  const dir = folder || ".knowledge";
  const useJson = render === "json";

  const entries = readIndex(dir);

  let filterFile = null;
  if (topic && topic !== "") {
    const entry = findIndexEntry(dir, topic);
    if (!entry) {
      throw new Error(`Entry not found: ${topic}`);
    }
    filterFile = entry.file;
  }

  const mermaid = buildMermaid(entries, filterFile);

  if (useJson) {
    console.log(JSON.stringify({ mermaid }, null, 2));
  } else {
    console.log(mermaid);
  }
}
