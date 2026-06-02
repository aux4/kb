# kb

aux4 knowledge base manager

## Description

Manage a markdown-based knowledge base stored in a local folder. Each entry is a markdown file, and an auto-maintained `index.json` tracks metadata, MD5 checksums, and cross-page references.

## Commands

- `kb add` - Add a new knowledge entry
- `kb update` - Update an existing knowledge entry
- `kb remove` - Remove a knowledge entry
- `kb search` - Search the knowledge base
- `kb list` - List all knowledge base entries
- `kb view` - View a knowledge base entry
- `kb links` - Show links between knowledge base entries
- `kb refs` - List references from a page to other pages
- `kb backrefs` - List pages that reference a given page
- `kb graph` - Generate a mermaid graph of page references

## Knowledge Base Structure

```
.knowledge/
├── index.json            # Metadata index (auto-maintained)
├── docker-networking.md  # Individual entries
└── go-error-handling.md
```
