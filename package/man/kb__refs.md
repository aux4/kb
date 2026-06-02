#### Description

The `refs` command lists all pages that a given page references (outbound links). It reads the stored references from the index and shows which pages exist and which are missing.

#### Usage

```bash
aux4 kb refs "<topic>" [--folder <path>] [--render <format>]
```

--folder   Knowledge base folder path (default: `.knowledge`)
--render   Output format: `text` or `json` (default: `text`)

#### Example

```bash
aux4 kb refs "Docker"
```

```text
References from Docker:
  → Kubernetes
  → networking.md (missing)
```

```bash
aux4 kb refs "Docker" --render json
```

```json
{
  "topic": "Docker",
  "file": "docker.md",
  "references": [
    { "file": "kubernetes.md", "topic": "Kubernetes", "exists": true },
    { "file": "networking.md", "topic": null, "exists": false }
  ]
}
```
