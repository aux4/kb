# kb list

```afterAll
rm -rf .knowledge .knowledge-empty
```

## with entries

### should list all entries

```execute
rm -rf .knowledge && aux4 kb add "Alpha Topic" --content "# Alpha\n\nFirst entry." --tags "test" && aux4 kb add "Beta Topic" --content "# Beta\n\nSecond entry." --tags "test" && aux4 kb list
```

```expect:partial
Alpha Topic
```

### should include both entries

```execute
aux4 kb list
```

```expect:partial
Beta Topic
```

### should show table headers

```execute
aux4 kb list
```

```expect:partial
| Topic | File | Tags | Date | Summary |
```

## empty knowledge base

### should show empty message

```execute
rm -rf .knowledge-empty && aux4 kb list --folder .knowledge-empty
```

```expect
Knowledge base is empty.
```
