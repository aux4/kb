# kb remove

```afterAll
rm -rf .knowledge
```

## remove entry

### should remove the entry

```execute
rm -rf .knowledge && aux4 kb add "Remove Test" --content "# Remove Me\n\nThis will be removed." --tags "test" && aux4 kb remove "Remove Test"
```

```expect
Added: Remove Test
Removed: Remove Test
```

### should not appear in list

```execute
aux4 kb list
```

```expect
Knowledge base is empty.
```

## validation

### should fail for nonexistent topic

```execute
rm -rf .knowledge && aux4 kb remove "Nonexistent" 2>&1; echo "exit:$?"
```

```expect:partial
Entry not found: Nonexistent
```
