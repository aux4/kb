# kb backrefs

```afterAll
rm -rf .knowledge
```

## inbound references

```beforeAll
rm -rf .knowledge
```

### should show pages that reference a topic

```execute
aux4 kb add "Docker" --content "# Docker\n\nContainer runtime." --tags "infra" && aux4 kb add "Kubernetes" --content "# Kubernetes\n\nBuilt on [Docker](docker.md)." --tags "infra" && aux4 kb add "Networking" --content "# Networking\n\nUsed by [Docker](docker.md)." --tags "infra" && aux4 kb backrefs "Docker"
```

```expect:partial
Kubernetes
```

### should show multiple backrefs

```execute
aux4 kb backrefs "Docker"
```

```expect:partial
Networking
```

### should show no backrefs for unreferenced page

```execute
aux4 kb add "Orphan" --content "# Orphan\n\nNo one links here." --tags "misc" && aux4 kb backrefs "Orphan"
```

```expect:partial
No pages reference Orphan.
```

## json output

```beforeAll
rm -rf .knowledge
```

### should output json

```execute
aux4 kb add "Docker" --content "# Docker\n\nRuntime." --tags "infra" && aux4 kb add "Kubernetes" --content "# Kubernetes\n\nUses [Docker](docker.md)." --tags "infra" && aux4 kb backrefs "Docker" --render json
```

```expect:partial
"backrefs"*?
```

### should include topic in json

```execute
aux4 kb backrefs "Docker" --render json
```

```expect:partial
"topic": "Docker"
```

## validation

### should fail for nonexistent topic

```execute
rm -rf .knowledge && aux4 kb backrefs "Nonexistent" 2>&1; echo "exit:$?"
```

```expect:partial
Entry not found: Nonexistent
```
