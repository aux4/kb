# kb view

```afterAll
rm -rf .knowledge
```

## view entry

### should output entry content

```execute
rm -rf .knowledge && aux4 kb add "View Test" --content "# View Test\n\nThis is the full content.\nWith multiple lines." --tags "test" && aux4 kb view "View Test"
```

```expect
Added: View Test
# View Test

This is the full content.
With multiple lines.
```

## validation

### should fail for nonexistent topic

```execute
rm -rf .knowledge && aux4 kb view "Nonexistent" 2>&1; echo "exit:$?"
```

```expect:partial
Entry not found: Nonexistent
```
