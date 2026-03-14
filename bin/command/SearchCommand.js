import { search } from "../../lib/Search.js";

export default async function searchCommand(params) {
  const [folder, query] = params;

  if (!query || query === "") {
    throw new Error("Query is required");
  }

  const results = search(folder || ".knowledge", query);

  if (results.length === 0) {
    console.log("No matches found.");
    return;
  }

  for (const result of results) {
    console.log(`\n## ${result.file}\n`);
    for (const match of result.matches) {
      console.log(`Line ${match.lineNumber}:`);
      console.log(match.context);
      console.log("");
    }
  }
}
