# kb refs

```afterAll
rm -rf .knowledge
```

## outbound references

```beforeAll
rm -rf .knowledge
```

### should show references from a page

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Kubernetes](kubernetes.md) and [Networking](networking.md)." --tags "infra" && aux4 kb add "Kubernetes" --content "# Kubernetes\n\nBuilt on [Docker](docker.md)." --tags "infra" && aux4 kb refs "Docker"
```

```expect:partial
Kubernetes
```

### should show missing references

```execute
aux4 kb refs "Docker"
```

```expect:partial
networking.md (missing)
```

### should show no references for page without links

```execute
aux4 kb add "Orphan" --content "# Orphan\n\nNo links here." --tags "misc" && aux4 kb refs "Orphan"
```

```expect:partial
Orphan has no references to other pages.
```

## json output

```beforeAll
rm -rf .knowledge
```

### should output json

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Kubernetes](kubernetes.md)." --tags "infra" && aux4 kb refs "Docker" --render json
```

```expect:partial
"references"*?
```

### should include topic in json

```execute
aux4 kb refs "Docker" --render json
```

```expect:partial
"topic": "Docker"
```

## validation

### should fail for nonexistent topic

```execute
rm -rf .knowledge && aux4 kb refs "Nonexistent" 2>&1; echo "exit:$?"
```

```expect:partial
Entry not found: Nonexistent
```
