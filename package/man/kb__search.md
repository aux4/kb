# kb search

Search the knowledge base

## Usage

```bash
aux4 kb search "<query>" [--folder <folder>]
```

## Variables

- `query` (required) - Search query
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Description

Searches all markdown entries (excluding `index.md`) and ranks them by relevance using BM25.

The search indexes three fields per entry and weights them differently:

- **title/topic** — the entry topic, weighted highest (×3)
- **tags** — the entry's comma-separated tags, weighted next (×2)
- **body** — the full markdown content (×1)

Because title and tags are indexed (not just the body), a query that matches only the topic or a tag still finds the entry. For example, searching the tag word `preferences` or the topic word `preference` will match an entry titled "response style preference" even when neither word appears verbatim in the body.

Queries and documents are tokenized, lowercased, stripped of punctuation, and **stemmed** (Porter stemmer), so morphological variants collapse to a single stem — `preference`, `prefers`, `preferences`, and `preferred` all match one another. Common stop words are ignored.

Results are returned **ranked by BM25 score (most relevant first)**; entries with no matching terms are dropped. For each entry, the output shows the file header (`## <file>.md`) followed by the matching body lines with surrounding context. When the match comes only from the title or tags (no matching body line), a synthetic header line is shown so the entry still carries context.

## Examples

```bash
aux4 kb search "networking"
```

```bash
aux4 kb search "preference"
```

```text

## response-style-preference.md

Line 1:
Prefers concise, bullet-point answers
```

```bash
aux4 kb search "error handling" --folder my-notes
```
