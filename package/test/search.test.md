# kb search

```beforeAll
rm -rf .knowledge
aux4 kb add "Docker Networking" --content "# Docker Networking\n\nDocker uses bridge networks by default.\nContainers communicate through the bridge." --tags "docker"
aux4 kb add "Go Errors" --content "# Go Error Handling\n\nGo uses explicit error returns.\nErrors are values in Go." --tags "go"
```

```afterAll
rm -rf .knowledge
```

## should find matching entries

```execute
aux4 kb search "bridge"
```

```expect:partial
docker-networking.md
```

## should show matching line

```execute
aux4 kb search "bridge"
```

```expect:partial
bridge networks
```

## should be case-insensitive

```execute
aux4 kb search "DOCKER"
```

```expect:partial
docker-networking.md
```

## should return no matches for unknown term

```execute
aux4 kb search "kubernetes"
```

```expect
No matches found.
```

## should search across multiple entries

```execute
aux4 kb search "uses"
```

```expect:partial
docker-networking.md
```
