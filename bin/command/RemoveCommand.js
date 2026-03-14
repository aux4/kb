import { removeEntry } from "../../lib/Entry.js";

export default async function removeCommand(params) {
  const [folder, topic] = params;

  if (!topic || topic === "") {
    throw new Error("Topic is required");
  }

  removeEntry(folder || ".knowledge", topic);
  console.log(`Removed: ${topic}`);
}
