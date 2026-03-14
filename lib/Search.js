import fs from "fs";
import path from "path";

export function search(folder, query) {
  if (!fs.existsSync(folder)) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const files = fs.readdirSync(folder).filter(f => f.endsWith(".md") && f !== "index.md");
  const results = [];

  for (const file of files) {
    const filePath = path.join(folder, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const matches = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(queryLower)) {
        const context = [];
        if (i > 0) context.push(lines[i - 1]);
        context.push(lines[i]);
        if (i < lines.length - 1) context.push(lines[i + 1]);

        matches.push({
          lineNumber: i + 1,
          line: lines[i],
          context: context.join("\n")
        });
      }
    }

    if (matches.length > 0) {
      results.push({ file, matches });
    }
  }

  return results;
}
