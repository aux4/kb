#### Description

The `graph` command generates a [Mermaid](https://mermaid.js.org/) diagram of page references. It can render the full knowledge base graph or focus on a specific page and its neighbors.

When a topic is specified, the graph includes only the target page, pages it references, and pages that reference it. The target page is highlighted with a distinct style. Missing pages (referenced but not created) are shown with a dashed red border.

#### Usage

```bash
aux4 kb graph [<topic>] [--folder <path>] [--render <format>]
```

--folder   Knowledge base folder path (default: `.knowledge`)
--render   Output format: `text` or `json` (default: `text`)

#### Example

```bash
aux4 kb graph
```

```text
graph LR
  docker["Docker"]
  kubernetes["Kubernetes"]
  docker --> kubernetes
  kubernetes --> docker
  classDef missing fill:#fdd,stroke:#c00,stroke-dasharray: 5 5
```

```bash
aux4 kb graph "Docker"
```

```text
graph LR
  docker["Docker"]
  kubernetes["Kubernetes"]
  docker --> kubernetes
  service_mesh["service-mesh"]:::missing
  docker --> service_mesh
  kubernetes --> docker
  style docker fill:#f9f,stroke:#333,stroke-width:2px
  classDef missing fill:#fdd,stroke:#c00,stroke-dasharray: 5 5
```

```bash
aux4 kb graph --render json
```

```json
{
  "mermaid": "graph LR\n  docker[\"Docker\"]\n  ..."
}
```
