# kb update

```afterAll
rm -rf .knowledge
```

## update entry

### should update entry content

```execute
rm -rf .knowledge && aux4 kb add "Update Test" --content "# Original\n\nOriginal content." --tags "test" && aux4 kb update "Update Test" --content "# Updated\n\nNew content."
```

```expect
Added: Update Test
Updated: Update Test
```

### should have new content

```execute
aux4 kb view "Update Test"
```

```expect
# Updated

New content.
```

### should update index summary

```execute
aux4 kb list
```

```expect:partial
New content.
```

## validation

### should fail for nonexistent topic

```execute
rm -rf .knowledge && aux4 kb update "Nonexistent" --content "content" 2>&1; echo "exit:$?"
```

```expect:partial
Entry not found: Nonexistent
```
