import { readEntry } from "../../lib/Entry.js";

export default async function viewCommand(params) {
  const [folder, topic] = params;

  if (!topic || topic === "") {
    throw new Error("Topic is required");
  }

  const content = readEntry(folder || ".knowledge", topic);
  console.log(content);
}
