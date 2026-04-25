# kb links integration

## creating entries with links

```beforeAll
rm -rf testdata-wiki
```

```afterAll
rm -rf testdata-wiki
```

### should create entries and detect links between them

```execute
aux4 kb add "Docker" --content "# Docker\n\nContainer runtime. See [Kubernetes](kubernetes.md) for orchestration." --tags infra --folder testdata-wiki
```

```expect:partial
*?
```

### should add second entry with backlink

```execute
aux4 kb add "Kubernetes" --content "# Kubernetes\n\nOrchestration built on [Docker](docker.md)." --tags infra --folder testdata-wiki
```

```expect:partial
*?
```

### should show graph with 2 pages and 2 links

```execute
aux4 kb links --folder testdata-wiki
```

```expect:partial
Graph: 2 pages, 2 links
```

### should show backlinks to docker

```execute
aux4 kb links --folder testdata-wiki --to docker.md
```

```expect:partial
kubernetes.md*?
```

### should show outbound from kubernetes

```execute
aux4 kb links --folder testdata-wiki --from kubernetes.md
```

```expect:partial
docker.md*?
```

## detecting missing pages from entries

```beforeAll
rm -rf testdata-wiki
```

```afterAll
rm -rf testdata-wiki
```

### should create entry with link to nonexistent page

```execute
aux4 kb add "API Gateway" --content "# API Gateway\n\nRoutes traffic. Uses [Service Mesh](service-mesh.md) internally." --tags infra --folder testdata-wiki
```

```expect:partial
*?
```

### should detect missing page

```execute
aux4 kb links --folder testdata-wiki --missing true
```

```expect:partial
service-mesh.md*?
```

### should resolve missing page after creating it

```execute
aux4 kb add "Service Mesh" --content "# Service Mesh\n\nManages service-to-service communication. See [API Gateway](api-gateway.md)." --tags infra --folder testdata-wiki
```

```expect:partial
*?
```

### should show no missing pages after creation

```execute
aux4 kb links --folder testdata-wiki --missing true
```

```expect
No missing pages found.
```

## orphan detection with real entries

```beforeAll
rm -rf testdata-wiki
```

```afterAll
rm -rf testdata-wiki
```

### should create connected and disconnected entries

```execute
aux4 kb add "Main Topic" --content "# Main Topic\n\nSee [Sub Topic](sub-topic.md)." --tags core --folder testdata-wiki && aux4 kb add "Sub Topic" --content "# Sub Topic\n\nLinked from [Main Topic](main-topic.md)." --tags core --folder testdata-wiki && aux4 kb add "Orphan Page" --content "# Orphan Page\n\nThis has no inbound links." --tags misc --folder testdata-wiki
```

```expect:partial
*?
```

### should detect orphan page

```execute
aux4 kb links --folder testdata-wiki --orphans true
```

```expect:partial
orphan-page.md
```
