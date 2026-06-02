import { findIndexEntry, readIndex } from "../../lib/Index.js";

export default async function backrefsCommand(params) {
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

  const allEntries = readIndex(dir);
  const backrefs = [];

  for (const e of allEntries) {
    const refs = e.references || [];
    if (refs.includes(entry.file)) {
      backrefs.push({ file: e.file, topic: e.topic });
    }
  }

  if (useJson) {
    console.log(JSON.stringify({ topic: entry.topic, file: entry.file, backrefs }, null, 2));
  } else {
    if (backrefs.length === 0) {
      console.log(`No pages reference ${entry.topic}.`);
    } else {
      console.log(`Pages that reference ${entry.topic}:`);
      for (const b of backrefs) {
        console.log(`  \u2190 ${b.topic}`);
      }
    }
  }
}
