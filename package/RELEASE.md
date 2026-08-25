# aux4/kb 0.1.10

## Newly written blocks are immediately searchable (KBT-012)

`kb search` builds its BM25 model from disk on every query — it reads
`index.json` and walks the whole folder tree (root plus every page subfolder at
any depth) at search time. There is no separate persisted search index to fall
out of sync, so any block written by `add`, `update`, `move`, or `remove` is
reflected in the very next `kb search` with no manual reindex step:

- `add` — a new block (including one nested in a page subfolder such as
  `aux4-cloud/platform-guide.md`) is found by its content immediately.
- `update` — new content is matched right away; text removed by the update stops
  matching.
- `remove` — the block drops out of search results as soon as it is deleted.

This closes KBT-012, where a block added into a page subfolder was viewable via
`kb view` but not returned by `kb search` on older, non-recursive builds. Search
now recurses the full tree, so foldered blocks rank alongside flat root blocks.

A regression suite (`kb__search__consistency.test.md`) locks in the
add → search, update → search, and remove → search consistency guarantees.
