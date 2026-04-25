#### Description

The `links` command analyzes markdown links between knowledge base entries to build a graph of relationships. It parses `[text](file.md)` links from all entries and reports the connection structure.

Modes:

- **Default** — show full graph summary: page count, link count, and per-page in/out degree
- **`--from`** — show outbound links from a specific page
- **`--to`** — show inbound links (backlinks) to a specific page
- **`--orphans`** — show pages with no inbound links (disconnected from the graph)
- **`--missing`** — show pages that are linked to but do not exist yet

Accepts either a topic name (auto-slugified) or a filename ending in `.md`.

#### Usage

```bash
aux4 kb links [--folder <path>] [--from <topic>] [--to <topic>] [--orphans true] [--missing true]
```

--folder   Knowledge base folder path (default: `.knowledge`)
--from     Show outbound links from this topic or file
--to       Show inbound links (backlinks) to this topic or file
--orphans  Show pages with zero inbound links (default: `false`)
--missing  Show pages that are referenced but don't exist (default: `false`)

#### Example

```bash
aux4 kb links
```

```text
Graph: 5 pages, 12 links

  docker.md        ← 3 in  → 2 out
  kubernetes.md    ← 2 in  → 3 out
  networking.md    ← 2 in  → 1 out
  monitoring.md    ← 1 in  → 2 out
  logging.md       ← 0 in  → 1 out

Missing pages:
  service-mesh.md (1 inbound)
```

```bash
aux4 kb links --to "Docker"
```

```text
Inbound links to docker.md:
  ← kubernetes.md (Docker)
  ← networking.md (Docker)
  ← monitoring.md (Docker containers)
```

```bash
aux4 kb links --orphans true
```

```text
Orphan pages (no inbound links):
  logging.md
```
