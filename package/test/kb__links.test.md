# kb links

## graph overview

```beforeAll
mkdir -p testdata-links
cat > testdata-links/index.md << 'EOF'
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Docker | docker.md | infra | 2026-04-25 | Container runtime |
| Kubernetes | kubernetes.md | infra | 2026-04-25 | Container orchestration |
| Networking | networking.md | infra | 2026-04-25 | Network basics |
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
cat > testdata-links/index.md << 'EOF'
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Docker | docker.md | infra | 2026-04-25 | Container runtime |
| Kubernetes | kubernetes.md | infra | 2026-04-25 | Container orchestration |
| Networking | networking.md | infra | 2026-04-25 | Network basics |
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
cat > testdata-links/index.md << 'EOF'
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Docker | docker.md | infra | 2026-04-25 | Container runtime |
| Kubernetes | kubernetes.md | infra | 2026-04-25 | Container orchestration |
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
cat > testdata-links/index.md << 'EOF'
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Kubernetes | kubernetes.md | infra | 2026-04-25 | Orchestration |
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
cat > testdata-links/index.md << 'EOF'
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Docker | docker.md | infra | 2026-04-25 | Runtime |
| Orphan | orphan.md | misc | 2026-04-25 | Lonely page |
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
cat > testdata-links/index.md << 'EOF'
# Knowledge Base

| Topic | File | Tags | Date | Summary |
|-------|------|------|------|---------|
| Docker | docker.md | infra | 2026-04-25 | Runtime |
| K8s | kubernetes.md | infra | 2026-04-25 | Orch |
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
