# kb reindex

Rebuild index.json to match the markdown files on disk

## Description

The `reindex` command rebuilds `index.json` so it reflects the markdown files actually present on disk, **without destroying existing metadata**. It walks the root and every nested subfolder to arbitrary depth (every `index.md` spine is excluded) and reconciles the walk against the current index.

- **Existing entries are kept verbatim** when their `file` still exists on disk. If an older entry is missing the `page` field, it is backfilled from the file's full parent path (`""` for root-level entries, e.g. `form-engine/realtime` for a nested block).
- **On-disk files not present in the index are synthesized** into new entries:
  - `topic` — the de-slugified filename (strip `.md`, split on `-`, capitalize each word).
  - `file` — the root-relative path.
  - `page` — the file's full parent path (`""` for root-level, e.g. `form-engine/realtime` for a nested block).
  - `tags` — empty.
  - `date` — the file's modification time (`YYYY-MM-DD`).
  - `summary` — the first ~160 characters of the body, collapsed to a single line.
  - `md5` — the MD5 of the file content.
  - `references` — the `[text](target.md)` links parsed from the body.
- **Index entries whose `file` no longer exists on disk are dropped** (removed as stale).

The rebuilt index is written through the same write lock and atomic-write path used by `add`/`remove`, so a concurrent mutation cannot corrupt it. A summary of kept / added / removed-stale counts is printed, listing every synthesized topic.

## Usage

```bash
aux4 kb reindex [--folder <folder>]
```

- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Example

```bash
aux4 kb reindex
```

```text
Reindexed .knowledge
  kept: 12
  added: 2
    - Orphan Block
    - Legacy Note
  removed (stale): 1
```
