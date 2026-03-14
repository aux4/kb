import { readIndex } from "../../lib/Index.js";

export default async function listCommand(params) {
  const [folder] = params;

  const entries = readIndex(folder || ".knowledge");

  if (entries.length === 0) {
    console.log("Knowledge base is empty.");
    return;
  }

  console.log("| Topic | File | Tags | Date | Summary |");
  console.log("|-------|------|------|------|---------|");
  for (const entry of entries) {
    console.log(`| ${entry.topic} | ${entry.file} | ${entry.tags} | ${entry.date} | ${entry.summary} |`);
  }
}
