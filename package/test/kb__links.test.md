# kb links

## graph overview

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.json << 'EOF'
[
  { "topic": "Docker", "file": "docker.md", "tags": "infra", "date": "2026-04-25", "summary": "Container runtime", "md5": "", "references": ["kubernetes.md", "networking.md"] },
  { "topic": "Kubernetes", "file": "kubernetes.md", "tags": "infra", "date": "2026-04-25", "summary": "Container orchestration", "md5": "", "references": ["docker.md", "networking.md", "service-mesh.md"] },
  { "topic": "Networking", "file": "networking.md", "tags": "infra", "date": "2026-04-25", "summary": "Network basics", "md5": "", "references": ["docker.md"] }
]
EOF

cat > testdata-links/docker.md << 'EOF'
# Docker

Container runtime. See also [Kubernetes](kubernetes.md) and [Networking](networking.md).
EOF

cat > testdata-links/kubernetes.md << 'EOF'
# Kubernetes

Container orchestration built on [Docker](docker.md). Requires [Networking](networking.md).
Also see [Service Mesh](service-mesh.md) for advanced patterns.
EOF

cat > testdata-links/networking.md << 'EOF'
# Networking

Network fundamentals used by [Docker](docker.md).
EOF
```

```afterAll
rm -rf testdata-links
```

### should show graph summary

```execute
aux4 kb links --folder testdata-links
```

```expect:partial
Graph: 3 pages, 6 links
```

## outbound links

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.json << 'EOF'
[
  { "topic": "Docker", "file": "docker.md", "tags": "infra", "date": "2026-04-25", "summary": "Container runtime", "md5": "", "references": ["kubernetes.md", "networking.md"] },
  { "topic": "Kubernetes", "file": "kubernetes.md", "tags": "infra", "date": "2026-04-25", "summary": "Container orchestration", "md5": "", "references": ["docker.md"] },
  { "topic": "Networking", "file": "networking.md", "tags": "infra", "date": "2026-04-25", "summary": "Network basics", "md5": "", "references": ["docker.md"] }
]
EOF

cat > testdata-links/docker.md << 'EOF'
# Docker

See [Kubernetes](kubernetes.md) and [Networking](networking.md).
EOF

cat > testdata-links/kubernetes.md << 'EOF'
# Kubernetes

Built on [Docker](docker.md).
EOF

cat > testdata-links/networking.md << 'EOF'
# Networking

Used by [Docker](docker.md).
EOF
```

```afterAll
rm -rf testdata-links
```

### should show outbound links from a page

```execute
aux4 kb links --folder testdata-links --from docker.md
```

```expect:partial
kubernetes.md*?
```

## backlinks

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.json << 'EOF'
[
  { "topic": "Docker", "file": "docker.md", "tags": "infra", "date": "2026-04-25", "summary": "Container runtime", "md5": "", "references": [] },
  { "topic": "Kubernetes", "file": "kubernetes.md", "tags": "infra", "date": "2026-04-25", "summary": "Container orchestration", "md5": "", "references": ["docker.md"] }
]
EOF

cat > testdata-links/docker.md << 'EOF'
# Docker

Container runtime.
EOF

cat > testdata-links/kubernetes.md << 'EOF'
# Kubernetes

Built on [Docker](docker.md).
EOF
```

```afterAll
rm -rf testdata-links
```

### should show inbound links to a page

```execute
aux4 kb links --folder testdata-links --to docker.md
```

```expect:partial
kubernetes.md*?
```

## missing pages

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.json << 'EOF'
[
  { "topic": "Kubernetes", "file": "kubernetes.md", "tags": "infra", "date": "2026-04-25", "summary": "Orchestration", "md5": "", "references": ["service-mesh.md"] }
]
EOF

cat > testdata-links/kubernetes.md << 'EOF'
# Kubernetes

See [Service Mesh](service-mesh.md) for advanced patterns.
EOF
```

```afterAll
rm -rf testdata-links
```

### should detect missing pages

```execute
aux4 kb links --folder testdata-links --missing true
```

```expect:partial
service-mesh.md*?
```

## orphan pages

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.json << 'EOF'
[
  { "topic": "Docker", "file": "docker.md", "tags": "infra", "date": "2026-04-25", "summary": "Runtime", "md5": "", "references": [] },
  { "topic": "Orphan", "file": "orphan.md", "tags": "misc", "date": "2026-04-25", "summary": "Lonely page", "md5": "", "references": [] }
]
EOF

cat > testdata-links/docker.md << 'EOF'
# Docker

Container runtime.
EOF

cat > testdata-links/orphan.md << 'EOF'
# Orphan

This page has no inbound links.
EOF
```

```afterAll
rm -rf testdata-links
```

### should detect orphan pages

```execute
aux4 kb links --folder testdata-links --orphans true
```

```expect:partial
orphan.md
```

## json output

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.json << 'EOF'
[
  { "topic": "Docker", "file": "docker.md", "tags": "infra", "date": "2026-04-25", "summary": "Runtime", "md5": "", "references": ["kubernetes.md"] },
  { "topic": "K8s", "file": "kubernetes.md", "tags": "infra", "date": "2026-04-25", "summary": "Orch", "md5": "", "references": ["docker.md"] }
]
EOF

cat > testdata-links/docker.md << 'EOF'
# Docker

See [Kubernetes](kubernetes.md).
EOF

cat > testdata-links/kubernetes.md << 'EOF'
# K8s

Built on [Docker](docker.md).
EOF
```

```afterAll
rm -rf testdata-links
```

### should output json when render is json

```execute
aux4 kb links --folder testdata-links --render json
```

```expect:partial
"type": "graph"
```

### should include nodes in json output

```execute
aux4 kb links --folder testdata-links --render json
```

```expect:partial
"nodes"*?
```

### should include edges in json output

```execute
aux4 kb links --folder testdata-links --render json
```

```expect:partial
"edges"*?
```

### should output json for orphans

```execute
aux4 kb links --folder testdata-links --orphans true --render json
```

```expect:partial
"type": "orphans"
```
