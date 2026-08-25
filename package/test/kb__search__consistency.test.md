# kb search write consistency

Regression coverage for KBT-012: a block written by `add`, `update`, or `remove`
must be reflected in `kb search` immediately, with no separate reindex step. The
search model is rebuilt from disk on every query, so any change to a block (even
one nested inside a page subfolder) is searchable right away.

```beforeAll
rm -rf .knowledge
```

```afterAll
rm -rf .knowledge
```

## a newly added foldered block is immediately searchable

```beforeAll
aux4 kb add "Platform Guide" --content "The cloud-file-sync daemon handles machine existence rental billing across the fleet." --page aux4-cloud --section Blocks
```

### should find the new foldered block by a body term

```execute
aux4 kb search "cloud-file-sync"
```

```expect:partial
aux4-cloud/platform-guide.md
```

### should find the new foldered block by a multi-word phrase

```execute
aux4 kb search "machine existence rental billing"
```

```expect:partial
aux4-cloud/platform-guide.md
```

## updating a block refreshes what search matches

```beforeAll
aux4 kb add "Sync Note" --content "This note mentions zephyrterm and nothing else notable."
```

### should find the block by its original term

```execute
aux4 kb search "zephyrterm"
```

```expect:partial
sync-note.md
```

### should find the block by a term added via update

```execute
aux4 kb update "Sync Note" --content "This note now mentions gyroscopeword instead." && aux4 kb search "gyroscopeword"
```

```expect:partial
sync-note.md
```

### should no longer match a term removed by the update

```execute
aux4 kb search "zephyrterm"
```

```expect
No matches found.
```

## removing a block drops it from search

```beforeAll
aux4 kb add "Temp Block" --content "The unicorntoken marker lives inside this temporary block." --page temp-page --section Blocks
```

### should find the block before removal

```execute
aux4 kb search "unicorntoken"
```

```expect:partial
temp-page/temp-block.md
```

### should remove the block

```execute
aux4 kb remove "Temp Block"
```

```expect:partial
Removed: Temp Block
```

### should not match after removal

```execute
aux4 kb search "unicorntoken"
```

```expect
No matches found.
```
