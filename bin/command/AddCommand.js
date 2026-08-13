import fs from "fs";
import { createEntry } from "../../lib/Entry.js";

export default async function addCommand(params) {
  const [folder, topic, content, file, tags, page, section] = params;

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

  createEntry(folder || ".knowledge", topic, entryContent, tags || "", page || "", section || "");
  console.log(`Added: ${topic}`);
}
