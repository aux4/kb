# kb

aux4 knowledge base manager

## Description

Manage a markdown-based knowledge base stored in a local folder. Each entry is a markdown file, and an auto-maintained `index.md` serves as a table of contents.

## Commands

- `kb add` - Add a new knowledge entry
- `kb update` - Update an existing knowledge entry
- `kb remove` - Remove a knowledge entry
- `kb search` - Search the knowledge base
- `kb list` - List all knowledge base entries
- `kb view` - View a knowledge base entry

## Knowledge Base Structure

```
.knowledge/
├── index.md              # Table of contents (auto-maintained)
├── docker-networking.md  # Individual entries
└── go-error-handling.md
```
