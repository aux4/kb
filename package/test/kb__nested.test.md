# kb nested pages

Arbitrary-depth nested pages: a folder tree of any depth
(`subject/subpage/.../blocks`) with an `index.md` spine at every level. A folder
is a **leaf** when it directly holds block `.md` files and a **parent** when it
holds sub-page folders. `kb page` inlines a leaf and renders a navigable index
for a parent; `kb move` into a nested path auto-links the whole ancestor chain.

```afterAll
rm -rf .knowledge
```

## deep move builds the ancestor chain

```beforeAll
rm -rf .knowledge
aux4 kb add "Deep Block" --content "# Deep Block\n\nContent at depth three." --tags "x"
aux4 kb move "Deep Block" --page a/b/c --section Details
```

### should be idempotent-safe and reject a re-move into the same path

```execute
aux4 kb move "Deep Block" --page a/b/c --section Details
```

```error:partial
Deep Block is already in page: a/b/c
```

### should move the block into the deep leaf folder

```execute
test -f .knowledge/a/b/c/deep-block.md && echo here || echo missing
```

```expect
here
```

### should link the block in the leaf spine

```execute
cat .knowledge/a/b/c/index.md
```

```expect
# c

## Details

- [[deep-block]]
```

### should auto-link the top ancestor to its child

```execute
cat .knowledge/a/index.md
```

```expect
# a

## Pages

- [[b]]
```

### should auto-link the middle ancestor to its child

```execute
cat .knowledge/a/b/index.md
```

```expect
# b

## Pages

- [[c]]
```

### should record the full parent path as the page field

```execute
node -e "const e=require('./.knowledge/index.json'); const f=e.find(x=>x.topic==='Deep Block'); console.log(f.page+' '+f.file)"
```

```expect
a/b/c a/b/c/deep-block.md
```

## kb page on a parent renders sub-page links, not inlined blocks

```beforeAll
rm -rf .knowledge
aux4 kb add "Late Joiner" --content "# Late Joiner\n\nHow late joiners sync state." --page form-engine/realtime --section Sync
```

### should render the top parent as a navigable index of sub-pages

```execute
aux4 kb page form-engine
```

```expect
# form-engine

## Pages

- **realtime**
```

### should include a sub-page overview line when the sub-page has prose

```execute
printf '# realtime\n\nRealtime collaboration sub-systems.\n\n## Sync\n\n- [[late-joiner]]\n' > .knowledge/form-engine/realtime/index.md && aux4 kb add "Presence" --content "# Presence\n\nWho is online." --page form-engine --section Areas && aux4 kb page form-engine
```

```expect:partial
- **realtime** — Realtime collaboration sub-systems.
```

## kb page on a leaf inlines its blocks

```beforeAll
rm -rf .knowledge
aux4 kb add "Late Joiner" --content "# Late Joiner\n\nHow late joiners sync state." --page form-engine/realtime --section Sync
```

### should inline the block body at the leaf

```execute
aux4 kb page form-engine/realtime
```

```expect
# realtime

## Sync

# Late Joiner

How late joiners sync state.
```

## reindex over a three-deep tree

```beforeAll
rm -rf .knowledge
aux4 kb add "Nested Note" --content "# Nested\n\nBody." --page one/two/three --section Notes
rm .knowledge/index.json
```

### should synthesize the deep block with its full parent path

```execute
aux4 kb reindex
```

```expect
Reindexed .knowledge
  kept: 0
  added: 1
    - Nested Note
  removed (stale): 0
```

### should record the full parent path as the page field

```execute
node -e "const e=require('./.knowledge/index.json'); const f=e.find(x=>x.topic==='Nested Note'); console.log(f.page+' '+f.file)"
```

```expect
one/two/three one/two/three/nested-note.md
```

## backward compatibility

```beforeAll
rm -rf .knowledge
aux4 kb add "Flat Entry" --content "# Flat\n\nA flat root block." --tags "flat"
aux4 kb add "One Level" --content "# One\n\nA one-level page block." --page guides --section Basics
```

### should keep flat root entries working

```execute
node -e "const e=require('./.knowledge/index.json'); const f=e.find(x=>x.topic==='Flat Entry'); console.log(f.page===''?'ROOT':'PAGE:'+f.page,f.file)"
```

```expect
ROOT flat-entry.md
```

### should keep one-level pages assembling as an inlined leaf

```execute
aux4 kb page guides
```

```expect
# guides

## Basics

# One

A one-level page block.
```

### should record a one-level page as the immediate folder

```execute
node -e "const e=require('./.knowledge/index.json'); const f=e.find(x=>x.topic==='One Level'); console.log(f.page+' '+f.file)"
```

```expect
guides guides/one-level.md
```
