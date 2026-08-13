# kb move

Relocate an existing entry into a page

## Description

The `move` command relocates an existing knowledge entry into a page (subfolder), keeping its filename (slug) and updating every place that tracks its location. It is the counterpart to `add --page`: use it to restructure flat entries into pages, or to move a block from one page to another.

`--page` may be a **nested path of any depth** (e.g. `a/b/c`); the whole folder chain is created and auto-linked.

- The entry is found by `topic` (case-insensitive); a clear error is raised when it does not exist.
- The block `.md` file is moved to `<folder>/<page>/<basename>.md` via an atomic rename (the nested page folder is created if needed). The filename/slug is preserved.
- When the entry was already in a source page, its `- [[<slug>]]` line is **stripped from the old page's spine** (`index.md`).
- The target (leaf) spine is ensured (created with a `# <name>` heading using the last path segment if absent) and the `- [[<slug>]]` link is appended under `--section` (default section `Blocks`).
- **Ancestor auto-linking**: every ancestor `index.md` is created (if missing) and linked to its child under a `Pages` section — a move into `a/b/c` yields `a/index.md → - [[b]]`, `a/b/index.md → - [[c]]`, and `a/b/c/index.md → - [[<slug>]]`. Sub-page links are idempotent, so repeated moves never duplicate them.
- The index entry's `page` (the full parent path) and `file` fields are updated.

The entire operation runs under a single index write lock, and every file write is atomic, so `kb page <page>` reliably assembles the moved block afterward.

## Usage

```bash
aux4 kb move "<topic>" --page <page> [--section <heading>] [--folder <folder>]
```

- `topic` (required) - Topic title of the entry to move
- `--page` (required) - Target page path to move the entry into (may be nested, e.g. `a/b/c`)
- `--section` (default: `Blocks`) - Section heading in the target (leaf) spine to append the block link under (created if absent)
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Example

```bash
aux4 kb move "Late Joiner" --page form-engine/realtime --section Sync
```

```text
Moved: Late Joiner -> form-engine/realtime
```

The block moves to `.knowledge/form-engine/realtime/late-joiner.md`. The leaf spine `.knowledge/form-engine/realtime/index.md` gains:

```markdown
# realtime

## Sync

- [[late-joiner]]
```

and the ancestor `.knowledge/form-engine/index.md` is created/linked to the sub-page:

```markdown
# form-engine

## Pages

- [[realtime]]
```

Afterward, `aux4 kb page form-engine` shows `realtime` as a sub-page link and `aux4 kb page form-engine/realtime` inlines the moved block.
