# kb move

```afterAll
rm -rf .knowledge
```

## move a flat entry into a page

```beforeAll
rm -rf .knowledge
aux4 kb add "Flat Note" --content "# Flat Note\n\nBody of the flat note." --tags "misc"
```

### should report the move

```execute
aux4 kb move "Flat Note" --page guides --section Basics
```

```expect
Moved: Flat Note -> guides
```

### should move the file into the page subfolder

```execute
cat .knowledge/guides/flat-note.md
```

```expect
# Flat Note

Body of the flat note.
```

### should remove the file from the root

```execute
test -f .knowledge/flat-note.md && echo present || echo gone
```

```expect
gone
```

### should update the index file and page

```execute
aux4 kb list
```

```expect:partial
| Flat Note | guides/flat-note.md | misc |
```

### should record the page field in the index

```execute
node -e "const e=require('./.knowledge/index.json'); const f=e.find(x=>x.topic==='Flat Note'); console.log(f.page)"
```

```expect
guides
```

### should link the block into the target page spine

```execute
cat .knowledge/guides/index.md
```

```expect
# guides

## Basics

- [[flat-note]]
```

### should assemble the moved block into the page

```execute
aux4 kb page guides
```

```expect:partial
Body of the flat note.
```

## move a block from one page to another strips the old spine link

```beforeAll
rm -rf .knowledge
aux4 kb add "Roaming Block" --content "# Roaming\n\nMoves between pages." --page source --section Notes
aux4 kb add "Stay Block" --content "# Stay\n\nStays behind." --page source --section Notes
```

### should report the page-to-page move

```execute
aux4 kb move "Roaming Block" --page dest --section Notes
```

```expect
Moved: Roaming Block -> dest
```

### should strip the link from the old page spine

```execute
cat .knowledge/source/index.md
```

```expect
# source

## Notes

- [[stay-block]]
```

### should add the link to the new page spine

```execute
cat .knowledge/dest/index.md
```

```expect
# dest

## Notes

- [[roaming-block]]
```

### should move the file to the new page folder

```execute
test -f .knowledge/dest/roaming-block.md && echo here || echo missing
```

```expect
here
```

## errors

```beforeAll
rm -rf .knowledge
aux4 kb add "Present" --content "Body." --tags "x"
```

### should error when the topic is not found

```execute
aux4 kb move "Nonexistent" --page somewhere
```

```error:partial
Entry not found: Nonexistent
```
