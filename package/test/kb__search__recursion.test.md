# kb search recursion

```beforeAll
rm -rf .knowledge
aux4 kb add "Flat Docker" --content "# Flat Docker\n\nDocker uses bridge networks." --tags "docker"
aux4 kb add "Stub Recursion" --content "Stubbing recursion with a bridge helper." --page aux4-mock --section Recursion
aux4 kb add "Stub Basics" --content "Basics of stubs." --page aux4-mock --section Recursion
```

```afterAll
rm -rf .knowledge
```

## search across the root and one level of subfolders

### should find a foldered block by content

```execute
aux4 kb search "recursion"
```

```expect:partial
aux4-mock/stub-recursion.md
```

### should still find a flat root entry (backward compatible)

```execute
aux4 kb search "bridge"
```

```expect:partial
flat-docker.md
```

### should report the foldered block path for a shared term

```execute
aux4 kb search "bridge"
```

```expect:partial
aux4-mock/stub-recursion.md
```

## exclude page spines from search

### should never match text that only lives in a page index.md

```execute
aux4 kb search "aux4-mock"
```

```expect
No matches found.
```

### should not surface index.md as a result file

```execute
aux4 kb search "Recursion" | grep "index.md" || echo "no index.md in results"
```

```expect
no index.md in results
```
