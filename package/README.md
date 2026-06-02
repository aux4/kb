# aux4/kb

aux4 knowledge base manager

aux4/kb manages a markdown-based knowledge base stored in a local folder. It provides commands to add, update, remove, search, list, and view knowledge entries. Each entry is a markdown file, and an auto-maintained `index.json` tracks metadata, MD5 checksums, and cross-page references.

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

- [`aux4 kb add`](#kb-add) - Add a new knowledge entry
- [`aux4 kb update`](#kb-update) - Update an existing knowledge entry
- [`aux4 kb remove`](#kb-remove) - Remove a knowledge entry
- [`aux4 kb search`](#kb-search) - Search the knowledge base
- [`aux4 kb list`](#kb-list) - List all knowledge base entries
- [`aux4 kb view`](#kb-view) - View a knowledge base entry
- [`aux4 kb links`](#kb-links) - Show links between knowledge base entries
- [`aux4 kb refs`](#kb-refs) - List references from a page to other pages
- [`aux4 kb backrefs`](#kb-backrefs) - List pages that reference a given page
- [`aux4 kb graph`](#kb-graph) - Generate a mermaid graph of page references

### kb add

Add a new knowledge entry to the knowledge base.

Variables:

- `topic` (required, arg) - Topic title
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path
- `--content` (optional) - Markdown content
- `--file` (optional) - Path to markdown file for content
- `--tags` (optional) - Comma-separated tags

```bash
aux4 kb add "Go Error Handling" --content "# Go Error Handling\n\nGo uses explicit error returns." --tags "go,errors"
```

Add from a file:

```bash
aux4 kb add "API Design" --file notes/api-design.md --tags "api,design"
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

Search the knowledge base with case-insensitive text matching.

Variables:

- `query` (required, arg) - Search query
- `--folder` (optional, default: `.knowledge`) - Knowledge base folder path

```bash
aux4 kb search "networking"
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

## Knowledge Base Structure

The knowledge base is stored as markdown files in a configurable folder (default `.knowledge/`):

```
.knowledge/
├── index.json            # Metadata index (auto-maintained)
├── docker-networking.md  # Individual entries
└── go-error-handling.md
```

The `index.json` file is a JSON array with metadata, MD5 checksums, and cross-page references:

```json
[
  {
    "topic": "Docker Networking",
    "file": "docker-networking.md",
    "tags": "docker,networking",
    "date": "2026-03-11",
    "summary": "Docker uses bridge networks by default.",
    "md5": "a1b2c3d4e5f6...",
    "references": ["go-error-handling.md"]
  }
]
```

## License

This package is licensed under the Apache License, Version 2.0.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
