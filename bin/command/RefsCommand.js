import { findIndexEntry, findIndexEntryByFile } from "../../lib/Index.js";

export default async function refsCommand(params) {
  const [folder, topic, render] = params;
  const dir = folder || ".knowledge";
  const useJson = render === "json";

  if (!topic || topic === "") {
    throw new Error("Topic is required");
  }

  const entry = findIndexEntry(dir, topic);
  if (!entry) {
    throw new Error(`Entry not found: ${topic}`);
  }

  const refs = entry.references || [];
  const results = refs.map(ref => {
    const target = findIndexEntryByFile(dir, ref);
    return {
      file: ref,
      topic: target ? target.topic : null,
      exists: !!target
    };
  });

  if (useJson) {
    console.log(JSON.stringify({ topic: entry.topic, file: entry.file, references: results }, null, 2));
  } else {
    if (results.length === 0) {
      console.log(`${entry.topic} has no references to other pages.`);
    } else {
      console.log(`References from ${entry.topic}:`);
      for (const r of results) {
        const label = r.topic || r.file;
        const status = r.exists ? "" : " (missing)";
        console.log(`  \u2192 ${label}${status}`);
      }
    }
  }
}
