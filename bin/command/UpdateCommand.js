import fs from "fs";
import { updateEntryContent } from "../../lib/Entry.js";

export default async function updateCommand(params) {
  const [folder, topic, content, file] = params;

  let entryContent = content ? content.replace(/\\n/g, "\n") : "";
  if (file && file !== "") {
    entryContent = fs.readFileSync(file, "utf-8");
  }

  if (!topic || topic === "") {
    throw new Error("Topic is required");
  }

  if (entryContent === "") {
    throw new Error("Content is required (use --content or --file)");
  }

  updateEntryContent(folder || ".knowledge", topic, entryContent);
  console.log(`Updated: ${topic}`);
}
