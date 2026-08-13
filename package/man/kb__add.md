# kb add

Add a new knowledge entry

## Usage

```bash
aux4 kb add "<topic>" [--content <content>] [--file <file>] [--tags <tags>] [--page <page>] [--section <heading>] [--folder <folder>]
```

## Variables

- `topic` (required) - Topic title
- `--content` - Markdown content for the entry
- `--file` - Path to a markdown file to use as content
- `--tags` - Comma-separated tags for the entry
- `--page` - Page path to add the block to (may be nested, e.g. `form-engine/realtime`); the block is written to `<folder>/<page>/<slug>.md` and linked into the page spine (`<folder>/<page>/index.md`)
- `--section` - Section heading in the page spine to append the block link under; the heading is created if absent. When omitted, the link is appended under a default trailing `Blocks` section
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Pages (folders)

Without `--page`, the entry is a flat root-level entry (`<folder>/<slug>.md`) with an empty `page` field in `index.json` — unchanged from prior behavior.

With `--page`, aux4/kb:

1. Writes the block to `<folder>/<page>/<slug>.md`.
2. Ensures the page spine `<folder>/<page>/index.md` exists (created with a `# <name>` heading — the last path segment — if absent).
3. Appends `- [[<slug>]]` under the `--section` heading (creating the heading if needed), forming an ordered list of block links.
4. Updates `index.json` with `page` set to the full parent path and `file` set to `<page>/<slug>.md`.

When `--page` is a **nested** path (e.g. `a/b/c`), the whole folder chain is created and each ancestor `index.md` is auto-linked to its child under a `Pages` section (`a/index.md → - [[b]]`, `a/b/index.md → - [[c]]`), so a deep add self-assembles a navigable tree — the same ancestor auto-linking that `kb move` performs. Sub-page links are idempotent.

## Examples

```bash
aux4 kb add "Docker Networking" --content "# Docker Networking\n\nDocker uses bridge networks." --tags "docker,networking"
```

```bash
aux4 kb add "API Design" --file notes/api-design.md --tags "api,design"
```

Add a block into a page under a named section:

```bash
aux4 kb add "Stub Recursion" --content "How to stub recursion." --page aux4-mock --section "Recursion"
```

```text
Added: Stub Recursion
```
