import { assemblePage } from "../../lib/Spine.js";

export default async function pageCommand(params) {
  const [folder, page] = params;
  const dir = folder || ".knowledge";

  if (!page || page === "") {
    throw new Error("Page name is required");
  }

  const assembled = assemblePage(dir, page);
  console.log(assembled);
}
