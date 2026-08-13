# kb reindex

```afterAll
rm -rf .knowledge
```

## synthesize an entry for an un-indexed file

```beforeAll
rm -rf .knowledge
aux4 kb add "Existing Entry" --content "# Existing\n\nAlready indexed." --tags "keep"
printf '# Orphan Block\n\nThis file was dropped in by hand.\n' > .knowledge/orphan-block.md
```

### should report the synthesized topic

```execute
aux4 kb reindex
```

```expect
Reindexed .knowledge
  kept: 1
  added: 1
    - Orphan Block
  removed (stale): 0
```

### should add the synthesized entry to the index

```execute
aux4 kb list
```

```expect:partial
| Orphan Block | orphan-block.md |
```

### should keep the existing entry verbatim

```execute
aux4 kb list
```

```expect:partial
| Existing Entry | existing-entry.md | keep |
```

## drop a stale index entry whose file is gone

```beforeAll
rm -rf .knowledge
aux4 kb add "Alpha" --content "Alpha body." --tags "a"
aux4 kb add "Beta" --content "Beta body." --tags "b"
rm .knowledge/beta.md
```

### should remove the stale entry and keep the live one

```execute
aux4 kb reindex
```

```expect
Reindexed .knowledge
  kept: 1
  added: 0
  removed (stale): 1
```

### should still list the live entry

```execute
aux4 kb list
```

```expect:partial
| Alpha | alpha.md | a |
```

### should have dropped the stale entry from the index

```execute
node -e "const e=require('./.knowledge/index.json'); console.log(e.some(x=>x.topic==='Beta'))"
```

```expect
false
```

## backfill the page field on an existing entry that lacks one

```beforeAll
rm -rf .knowledge
mkdir -p .knowledge/notes
printf '# Foldered\n\nA block inside a page.\n' > .knowledge/notes/foldered-note.md
printf '[\n  {\n    "topic": "Foldered Note",\n    "file": "notes/foldered-note.md",\n    "tags": "",\n    "date": "2026-01-01",\n    "summary": "A block inside a page.",\n    "md5": "x",\n    "references": []\n  }\n]\n' > .knowledge/index.json
```

### should reindex without adding or removing

```execute
aux4 kb reindex
```

```expect
Reindexed .knowledge
  kept: 1
  added: 0
  removed (stale): 0
```

### should backfill the page field from the folder

```execute
node -e "const e=require('./.knowledge/index.json'); console.log(e[0].page)"
```

```expect
notes
```
