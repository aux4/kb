# kb graph

```afterAll
rm -rf .knowledge
```

## full graph

```beforeAll
rm -rf .knowledge
```

### should generate mermaid for all pages

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Kubernetes](kubernetes.md)." --tags "infra" && aux4 kb add "Kubernetes" --content "# Kubernetes\n\nBuilt on [Docker](docker.md)." --tags "infra" && aux4 kb graph
```

```expect:partial
graph LR
```

### should include node definitions

```execute
aux4 kb graph
```

```expect:partial
docker["Docker"]
```

### should include edges

```execute
aux4 kb graph
```

```expect:partial
docker --> kubernetes
```

## single page graph

```beforeAll
rm -rf .knowledge
```

### should generate graph focused on a page

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Kubernetes](kubernetes.md)." --tags "infra" && aux4 kb add "Kubernetes" --content "# Kubernetes\n\nBuilt on [Docker](docker.md)." --tags "infra" && aux4 kb graph "Docker"
```

```expect:partial
style docker fill:#f9f*?
```

## missing pages in graph

```beforeAll
rm -rf .knowledge
```

### should mark missing pages

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Service Mesh](service-mesh.md)." --tags "infra" && aux4 kb graph
```

```expect:partial
service_mesh*?:::missing
```

### should include missing class definition

```execute
aux4 kb graph
```

```expect:partial
classDef missing*?
```

## json output

```beforeAll
rm -rf .knowledge
```

### should output json with mermaid

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Kubernetes](kubernetes.md)." --tags "infra" && aux4 kb graph --render json
```

```expect:partial
"mermaid"*?
```

## empty graph

```beforeAll
rm -rf .knowledge
```

### should generate empty graph

```execute
aux4 kb add "Orphan" --content "# Orphan\n\nNo links." --tags "misc" && aux4 kb graph
```

```expect:partial
graph LR
  orphan["Orphan"]
  classDef missing*?
```

## validation

### should fail for nonexistent topic

```execute
rm -rf .knowledge && aux4 kb graph "Nonexistent" 2>&1; echo "exit:$?"
```

```expect:partial
Entry not found: Nonexistent
```
