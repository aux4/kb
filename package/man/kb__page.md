# kb page

Assemble and print a page from its spine

## Description

The `page` command reads a page spine (`<folder>/<page>/index.md`) and assembles a human-readable markdown page. `<page>` may be a nested path of any depth (e.g. `form-engine/realtime`). Each `- [[X]]` link in the spine is resolved by kind:

- **X is a block** (`<folder>/<page>/X.md`) → the block's body is **inlined** (its YAML frontmatter, a leading `--- ... ---` block, is stripped; the rest is kept). A page whose links are all blocks is a right-sized, readable **leaf** document.
- **X is a sub-page** (`<folder>/<page>/X/` with its own `index.md`) → a single navigation line `- **X** — <overview>` is rendered, where the overview is the first prose line of the sub-page's `index.md` (omitted when the sub-page has only a title and links). The sub-tree is **not** recursively inlined, so a page that links sub-pages stays a navigable **parent** index.

The spine's own headings and prose are preserved. The command errors clearly when the page folder is missing, the spine `index.md` is missing, or a `[[X]]` link resolves to neither a block nor a sub-page.

## Usage

```bash
aux4 kb page "<page>" [--folder <folder>]
```

- `page` (required) - Page path to assemble (may be nested, e.g. `form-engine/realtime`)
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Example

Leaf page — inline the blocks. Given the spine `.knowledge/aux4-mock/index.md`:

```markdown
# aux4-mock

## Recursion

- [[stub-recursion]]
- [[stub-basics]]
```

```bash
aux4 kb page aux4-mock
```

```text
# aux4-mock

## Recursion

How to stub recursion.
Basics of stubs.
```

Parent page — render sub-page links, not the sub-tree. Given the spine `.knowledge/form-engine/index.md` where `realtime/` is a sub-page folder:

```markdown
# form-engine

## Pages

- [[realtime]]
```

```bash
aux4 kb page form-engine
```

```text
# form-engine

## Pages

- **realtime** — Realtime collaboration sub-systems.
```
