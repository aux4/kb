#### Description

The `backrefs` command lists all pages that reference a given page (inbound links / backlinks). It scans the references stored in the index to find pages that link to the specified topic.

#### Usage

```bash
aux4 kb backrefs "<topic>" [--folder <path>] [--render <format>]
```

--folder   Knowledge base folder path (default: `.knowledge`)
--render   Output format: `text` or `json` (default: `text`)

#### Example

```bash
aux4 kb backrefs "Docker"
```

```text
Pages that reference Docker:
  ← Kubernetes
  ← Networking
```

```bash
aux4 kb backrefs "Docker" --render json
```

```json
{
  "topic": "Docker",
  "file": "docker.md",
  "backrefs": [
    { "file": "kubernetes.md", "topic": "Kubernetes" },
    { "file": "networking.md", "topic": "Networking" }
  ]
}
```
