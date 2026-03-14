# aux4/kb

aux4 knowledge base manager

aux4/kb manages a markdown-based knowledge base stored in a local folder. It provides commands to add, update, remove, search, list, and view knowledge entries. Each entry is a markdown file, and an auto-maintained `index.md` serves as a table of contents.

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

## Knowledge Base Structure

The knowledge base is stored as markdown files in a configurable folder (default `.knowledge/`):

```
.knowledge/
├── index.md              # Table of contents (auto-maintained)
├── docker-networking.md  # Individual entries
└── go-error-handling.md
```

The `index.md` file is a markdown table:

```markdown
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Docker Networking | docker-networking.md | docker,networking | 2026-03-11 | Docker uses bridge networks by default. |
```

## Package manifest (.aux4)

```json
{
  "scope": "aux4",
  "name": "kb",
  "version": "0.1.0",
  "description": "aux4 knowledge base manager",
  "tags": [
    "aux4",
    "kb",
    "knowledge",
    "markdown"
  ],
  "profiles": [
    {
      "name": "main",
      "commands": [
        {
          "name": "kb",
          "execute": ["profile:kb"],
          "help": { "text": "aux4 knowledge base manager" }
        }
      ]
    },
    {
      "name": "kb",
      "commands": [
        { "name": "add", "help": { "text": "Add a new knowledge entry" } },
        { "name": "update", "help": { "text": "Update an existing knowledge entry" } },
        { "name": "remove", "help": { "text": "Remove a knowledge entry" } },
        { "name": "search", "help": { "text": "Search the knowledge base" } },
        { "name": "list", "help": { "text": "List all knowledge base entries" } },
        { "name": "view", "help": { "text": "View a knowledge base entry" } }
      ]
    }
  ]
}
```

## License

This package is licensed under the Apache License, Version 2.0.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
