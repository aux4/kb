import { reindexFolder } from "../../lib/Reindex.js";

export default async function reindexCommand(params) {
  const [folder] = params;
  const dir = folder || ".knowledge";

  const { kept, added, removedStale } = reindexFolder(dir);

  console.log(`Reindexed ${dir}`);
  console.log(`  kept: ${kept}`);
  console.log(`  added: ${added.length}`);
  for (const topic of added) {
    console.log(`    - ${topic}`);
  }
  console.log(`  removed (stale): ${removedStale}`);
}
