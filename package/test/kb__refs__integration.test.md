# kb refs integration

## reference cleanup on delete

```beforeAll
rm -rf .knowledge
```

```afterAll
rm -rf .knowledge
```

### should create entries with cross-references

```execute
aux4 kb add "Docker" --content "# Docker\n\nSee [Kubernetes](kubernetes.md) and [Networking](networking.md)." --tags "infra" && aux4 kb add "Kubernetes" --content "# Kubernetes\n\nBuilt on [Docker](docker.md)." --tags "infra"
```

```expect:partial
Added: Kubernetes
```

### should show references before delete

```execute
aux4 kb refs "Docker"
```

```expect:partial
Kubernetes
```

### should show backrefs before delete

```execute
aux4 kb backrefs "Kubernetes"
```

```expect:partial
Docker
```

### should remove references when page is deleted

```execute
aux4 kb remove "Kubernetes" && aux4 kb refs "Docker"
```

```expect:partial
networking.md (missing)
```

### should strip deleted page link from content

```execute
aux4 kb view "Docker"
```

```expect
# Docker

See Kubernetes and [Networking](networking.md).
```

## md5 updates on content change

```beforeAll
rm -rf .knowledge
```

```afterAll
rm -rf .knowledge
```

### should track md5 on add

```execute
aux4 kb add "Test Page" --content "# Test\n\nOriginal content." --tags "test" && aux4 kb refs "Test Page" --render json
```

```expect:partial
"file": "test-page.md"
```

### should update references on content change

```execute
aux4 kb update "Test Page" --content "# Test\n\nNow links to [Docker](docker.md)." && aux4 kb refs "Test Page"
```

```expect:partial
docker.md (missing)
```

### should clear references when links removed

```execute
aux4 kb update "Test Page" --content "# Test\n\nNo more links." && aux4 kb refs "Test Page"
```

```expect:partial
Test Page has no references to other pages.
```
