# aux4/kb

aux4 knowledge base manager

aux4/kb manages a markdown-based knowledge base stored in a local folder. It provides commands to add, update, remove, search, list, view, move, and reindex knowledge entries, organize them into nested pages, and assemble a page for reading. Search ranks results with BM25 across title, tags, and body. Each entry is a markdown file (a **block**), a folder is a **page**, and an auto-maintained `index.json` tracks metadata, MD5 checksums, the `page` (folder path), and cross-page references. Every mutation is serialized with a cross-process index lock and written atomically, so concurrent processes never corrupt or clobber the index.

## Installation

```bash
aux4 aux4 pkger install aux4/kb
```

## Quick Start

Add a knowledge entry:

```bash
aux4 kb add "Docker Networking" --content "# Docker Networking\n\nDocker uses bridge networks by default." --tags "docker,networking"
```

List all entries:

```bash
aux4 kb list
```

Search for a term:

```bash
aux4 kb search "bridge"
```

View an entry:

```bash
aux4 kb view "Docker Networking"
```

## Usage

### Main Commands

- [`aux4 kb add`](#kb-add) - Add a new knowledge entry (optionally into a page)
- [`aux4 kb update`](#kb-update) - Update an existing knowledge entry
- [`aux4 kb remove`](#kb-remove) - Remove a knowledge entry
- [`aux4 kb search`](#kb-search) - Search the knowledge base (BM25 ranking)
- [`aux4 kb list`](#kb-list) - List all knowledge base entries
- [`aux4 kb view`](#kb-view) - View a knowledge base entry
- [`aux4 kb page`](#kb-page) - Assemble and print a page from its spine
- [`aux4 kb move`](#kb-move) - Relocate an existing entry into a page
- [`aux4 kb reindex`](#kb-reindex) - Rebuild `index.json` to match files on disk
- [`aux4 kb links`](#kb-links) - Show links between knowledge base entries
- [`aux4 kb refs`](#kb-refs) - List references from a page to other pages
- [`aux4 kb backrefs`](#kb-backrefs) - List pages that reference a given page
- [`aux4 kb graph`](#kb-graph) - Generate a mermaid graph of page references

### kb add

Add a new knowledge entry to the knowledge base. Without `--page` the entry is a flat root-level block; with `--page` it is written into a page (subfolder) and linked into that page's spine (see [Pages](#pages-folders)).

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path
- `--content` (optional) - Markdown content
- `--file` (optional) - Path to markdown file for content
- `--tags` (optional) - Comma-separated tags
- `--page` (optional) - Page path to add the block to (may be nested, e.g. `form-engine/realtime`); the block is written to `<folder>/<page>/<slug>.md` and linked into the page spine
- `--section` (optional) - Section heading in the page spine to append the block link under (created if absent; default `Blocks`)

```bash
aux4 kb add "Go Error Handling" --content "# Go Error Handling\n\nGo uses explicit error returns." --tags "go,errors"
```

Add from a file:

```bash
aux4 kb add "API Design" --file notes/api-design.md --tags "api,design"
```

Add a block into a page under a named section:

```bash
aux4 kb add "Stub Recursion" --content "How to stub recursion." --page aux4-mock --section "Recursion"
```

### kb update

Update an existing knowledge entry.

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path
- `--content` (optional) - New markdown content
- `--file` (optional) - Path to markdown file for content

```bash
aux4 kb update "Docker Networking" --content "# Docker Networking\n\nUpdated content about overlay networks."
```

### kb remove

Remove a knowledge entry from the knowledge base.

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb remove "Docker Networking"
```

### kb search

Search the knowledge base. Entries are ranked by relevance using **BM25** across three fields, with title and tags weighted higher than the body:

- **title/topic** (×3)
- **tags** (×2)
- **body** (×1)

Because title and tags are indexed — not just the body — a query that matches only the topic or a tag still finds the entry (e.g. searching the tag word `preferences`, or the topic word `preference`, matches an entry titled "response style preference" even when the word is absent from the body). Queries and documents are tokenized and **stemmed** (Porter stemmer), so `preference`, `prefers`, `preferences`, and `preferred` all match one another; common stop words are ignored.

Results are returned ranked by score (most relevant first), with the file header followed by the matching lines and surrounding context. Entries with no matching terms are dropped.

The ranking model is built from disk on every query — `search` reads `index.json` and walks the whole folder tree (root plus every page subfolder, at any depth) at query time. There is no separate persisted search index, so a block written by `add`, `update`, `move`, or `remove` — including one nested inside a page — is reflected in the very next `kb search` with no manual reindex step.

Variables:

- `query` (required, arg) - Search query
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

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

### kb list

List all entries in the knowledge base.

Variables:

- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb list
```

### kb view

View the content of a knowledge base entry.

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb view "Docker Networking"
```

### kb page

Assemble and print a page from its spine (`<folder>/<page>/index.md`), inlining each block. `<page>` may be a nested path of any depth (e.g. `form-engine/realtime`). For each `- [[X]]` link in the spine:

- if `X` is a **block** (`<page>/X.md`) → its body is inlined (a leading `--- ... ---` YAML frontmatter block is stripped);
- if `X` is a **sub-page** (`<page>/X/` with its own `index.md`) → a navigation line `- **X** — <overview>` is rendered and the sub-tree is **not** inlined, so a parent page stays a navigable index.

The spine's own headings and prose are preserved.

Variables:

- `page` (required, arg) - Page path to assemble (may be nested, e.g. `form-engine/realtime`)
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb page aux4-mock
```

```text
# aux4-mock

## Recursion

How to stub recursion.
Basics of stubs.
```

### kb move

Relocate an existing entry into a page (subfolder), keeping its filename (slug). The block `.md` is moved, the link is stripped from the old page's spine (if any) and appended to the target page's spine, and — for a nested target (e.g. `a/b/c`) — the whole ancestor chain is auto-linked. The index entry's `page` and `file` are updated. It is the counterpart to `add --page`.

Variables:

- `topic` (required, arg) - Topic title of the entry to move
- `--page` (required) - Target page path (may be nested, e.g. `a/b/c`)
- `--section` (optional, default: `Blocks`) - Section heading in the target spine to append the block link under
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb move "Late Joiner" --page form-engine/realtime --section Sync
```

```text
Moved: Late Joiner -> form-engine/realtime
```

### kb reindex

Rebuild `index.json` to match the markdown files on disk, non-destructively. It walks the root and every nested page subfolder (every `index.md` spine is excluded) and reconciles it against the current index:

- existing entries whose file still exists are kept verbatim (a missing `page` field is backfilled from the file's folder);
- on-disk files not present in the index get a synthesized entry (topic de-slugified from the filename);
- index entries whose file no longer exists are dropped as stale.

Variables:

- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb reindex
```

```text
Reindexed .knowledge
  kept: 12
  added: 2
    - Orphan Block
    - Legacy Note
  removed (stale): 1
```

### kb refs

List all pages that a given page references (outbound links).

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path
- `--render` (optional, default: `text`) - Output format (`text` or `json`)

```bash
aux4 kb refs "Docker"
```

### kb backrefs

List all pages that reference a given page (inbound links / backlinks).

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path
- `--render` (optional, default: `text`) - Output format (`text` or `json`)

```bash
aux4 kb backrefs "Docker"
```

### kb graph

Generate a mermaid graph of page references. Optionally focus on a single page and its neighbors.

Variables:

- `topic` (optional, arg) - Topic title (generates graph for specific page)
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path
- `--render` (optional, default: `text`) - Output format (`text` or `json`)

```bash
# Full graph
aux4 kb graph

# Graph focused on a page
aux4 kb graph "Docker"
```

## Pages (folders)

aux4/kb follows a Confluence-style model:

- a **block** is a single markdown file (one atomic entry);
- a **page** is a folder that groups blocks and/or sub-pages;
- a page **spine** is the folder's `index.md`: headings with an ordered list of `- [[block]]` links. The spine is metadata, not a searchable block, so it is excluded from `kb search`.

Root-level `.md` files remain valid flat entries (`page` is `""`), so existing knowledge bases keep working unchanged. Pages can nest to any depth.

- `kb add --page <path> --section <heading>` writes the block into `<folder>/<path>/` and links it into the page spine. A nested `<path>` (e.g. `a/b/c`) creates the whole folder chain and auto-links each ancestor `index.md` to its child under a `Pages` section, so a deep add self-assembles a navigable tree.
- `kb move <topic> --page <path>` relocates an existing block into a page, stripping the old spine link and adding the new one (with the same ancestor auto-linking).
- `kb page <path>` assembles the spine into a readable document: a leaf page inlines its blocks; a parent page renders sub-page navigation links.
- `kb search` recurses the whole tree and ranks blocks with BM25; `kb refs`/`kb backrefs`/`kb links`/`kb graph` resolve both `[text](file.md)` links and `[[slug]]` wikilinks (a wikilink inside a page resolves to `<page>/<slug>.md`).

## Concurrency

Every mutating command (`add`, `update`, `remove`, `move`, `reindex`) performs its whole read-modify-write of `index.json` — plus the block `.md` and any page spine — while holding a cross-process advisory lock (`index.json.lock`). The index and spines are written to a temp file and atomically renamed into place. Two `kb add` processes started at the same time therefore never lose an entry or observe a half-written index; the lock is always released, and a lock left behind by a crashed process is reclaimed once stale.

## Knowledge Base Structure

The knowledge base is stored as markdown files in a configurable folder (default `.knowledge/`):

```text
.knowledge/
├── index.json            # Metadata index (auto-maintained)
├── docker-networking.md  # Flat root block
├── go-error-handling.md  # Flat root block
└── aux4-mock/            # A page
    ├── index.md          # Page spine (headings + [[block]] links, excluded from search)
    ├── stub-recursion.md # A block
    └── stub-basics.md    # A block
```

The `index.json` file is a JSON array with metadata, MD5 checksums, the `page` (folder path, `""` for root), and cross-page references:

```json
[
  {
    "topic": "Docker Networking",
    "file": "docker-networking.md",
    "page": "",
    "tags": "docker,networking",
    "date": "2026-03-11",
    "summary": "Docker uses bridge networks by default.",
    "md5": "a1b2c3d4e5f6...",
    "references": ["go-error-handling.md"]
  },
  {
    "topic": "Stub Recursion",
    "file": "aux4-mock/stub-recursion.md",
    "page": "aux4-mock",
    "tags": "mock",
    "date": "2026-03-11",
    "summary": "How to stub recursion.",
    "md5": "f6e5d4c3b2a1...",
    "references": []
  }
]
```

## License

This package is licensed under the Apache License, Version 2.0.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
