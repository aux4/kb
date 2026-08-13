# kb

aux4 knowledge base manager

## Description

Manage a markdown-based knowledge base stored in a local folder. It follows a Confluence-style page model: a folder is a page (a subject), a file is a block (one atomic entry), and `index.md` is the page spine (headings with an ordered list of `[[block]]` links). Root-level `.md` files remain valid flat entries. An auto-maintained `index.json` tracks metadata, MD5 checksums, the `page` (folder path), and cross-page references. Every mutation is serialized with a cross-process index lock and written atomically, so concurrent `kb add`/`kb move`/`kb remove` processes never corrupt or clobber the index.

## Commands

- `kb add` - Add a new knowledge entry (`--page`/`--section` add it into a page spine)
- `kb update` - Update an existing knowledge entry
- `kb remove` - Remove a knowledge entry
- `kb search` - Search the knowledge base with BM25 ranking (recurses nested page subfolders to any depth)
- `kb list` - List all knowledge base entries
- `kb view` - View a knowledge base entry
- `kb page` - Assemble and print a page from its spine
- `kb move` - Relocate an existing entry into a page (subfolder)
- `kb reindex` - Rebuild index.json to match the markdown files on disk
- `kb links` - Show links between knowledge base entries
- `kb refs` - List references from a page to other pages
- `kb backrefs` - List pages that reference a given page
- `kb graph` - Generate a mermaid graph of page references

## Knowledge Base Structure

```text
.knowledge/
├── index.json            # Metadata index (auto-maintained)
├── docker-networking.md  # Flat root entry
├── go-error-handling.md  # Flat root entry
└── aux4-mock/            # A page
    ├── index.md          # Page spine (headings + [[block]] links, excluded from search)
    ├── stub-recursion.md # A block
    └── stub-basics.md    # A block
```
