import { moveEntry } from "../../lib/Entry.js";

export default async function moveCommand(params) {
  const [folder, topic, page, section] = params;

  if (!topic || topic === "") {
    throw new Error("Topic is required");
  }
  if (!page || page === "") {
    throw new Error("Page is required");
  }

  moveEntry(folder || ".knowledge", topic, page, section || "");
  console.log(`Moved: ${topic} -> ${page}`);
}
