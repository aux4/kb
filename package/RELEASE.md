# aux4/kb 0.1.9

## Folder pages, nested to any depth (Confluence model)

aux4/kb now organizes blocks into pages. A folder is a **page** (a subject), a file is a **block** (one atomic entry), and each folder's `index.md` is the page **spine** — headings with an ordered list of `- [[block]]` links. Pages nest to arbitrary depth (`subject/subpage/.../blocks`). Flat root-level entries remain fully supported and behave exactly as before.

- `index.json` entries gain a `page` field (the block's folder path relative to the root, `""` for flat/root entries), and `file` is the root-relative path (e.g. `aux4-mock/stub-recursion.md`). Existing entries are backfilled by `reindex`.
- `search` and the link graph recurse the whole tree; every `index.md` spine (at every level) is excluded from search — it is metadata, not a searchable block. BM25 ranking is unchanged.

## `kb add --page <path> [--section <heading>]`

Write a block into a page and link it into the page spine. Without `--page`, `add` is unchanged (flat root entry). With `--page`:

- writes the block to `<folder>/<path>/<slug>.md`;
- ensures `<folder>/<path>/index.md` exists (created with `# <name>` if absent);
- appends `- [[<slug>]]` under `--section` (heading created if absent; default `Blocks`);
- for a nested `<path>` (e.g. `a/b/c`), creates the whole folder chain and auto-links each ancestor `index.md` to its child under a `Pages` section, so a deep add self-assembles a navigable tree.

## `kb move <topic> --page <path> [--section <heading>]` (new)

Relocate an existing entry into a page, keeping its filename. Moves the block `.md`, strips the `- [[slug]]` link from the old page spine (when moving page-to-page), links it into the target spine, auto-links the ancestor chain for a nested target, and updates the index entry's `page` and `file`.

## `kb page <path>` (new)

Assemble and print a human-readable page from its spine. A **leaf** page inlines each block's body (YAML frontmatter stripped); a **parent** page renders `- **sub-page** — <overview>` navigation links instead of recursing, so it stays a navigable index. Errors clearly when the page folder, its `index.md`, or a referenced block is missing.

## `kb reindex` (new)

Rebuild `index.json` to match the markdown files on disk, non-destructively: existing entries are kept verbatim (a missing `page` field is backfilled from the folder), on-disk files not in the index are synthesized into new entries, and index entries whose file is gone are dropped as stale.

## Wiki-link graph

Link extraction recognizes `[[slug]]` wikilinks in addition to `[text](file.md)` links. A wikilink inside a page resolves to `<page>/<slug>.md`, so `refs`, `backrefs`, `graph`, and `links --missing` work across page spines.

## Safety

All new mutations (`move`, `reindex`, and page-aware `add`) go through the same cross-process index lock and atomic writes introduced in 0.1.8 — the whole read-modify-write of `index.json`, the block `.md`, and page spines is serialized, so concurrent processes never corrupt or clobber the knowledge base.
