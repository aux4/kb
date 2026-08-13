# kb add --page

```afterAll
rm -rf .knowledge
```

## add a block to a page with a section

### should add the foldered block

```execute
rm -rf .knowledge && aux4 kb add "Stub Recursion" --content "# Stub Recursion\n\nHow stubbing recursion works." --tags "mock" --page aux4-mock --section Recursion
```

```expect
Added: Stub Recursion
```

### should write the block into the page subfolder

```execute
cat .knowledge/aux4-mock/stub-recursion.md
```

```expect
# Stub Recursion

How stubbing recursion works.
```

### should create the page spine with the section and link

```execute
cat .knowledge/aux4-mock/index.md
```

```expect
# aux4-mock

## Recursion

- [[stub-recursion]]
```

### should record the page and relative file in the index

```execute
aux4 kb list
```

```expect:partial
| Stub Recursion | aux4-mock/stub-recursion.md | mock |
```

## add a second block under the same section

```beforeAll
rm -rf .knowledge
aux4 kb add "Stub Recursion" --content "# Stub Recursion\n\nRecursion stubbing." --page aux4-mock --section Recursion
aux4 kb add "Stub Basics" --content "Basics of stubs." --page aux4-mock --section Recursion
```

### should append the link under the existing section

```execute
cat .knowledge/aux4-mock/index.md
```

```expect
# aux4-mock

## Recursion

- [[stub-recursion]]
- [[stub-basics]]
```

## add without a section falls back to a default section

```beforeAll
rm -rf .knowledge
aux4 kb add "Loose Note" --content "A loose note." --page aux4-mock
```

### should append the link under the default Blocks section

```execute
cat .knowledge/aux4-mock/index.md
```

```expect
# aux4-mock

## Blocks

- [[loose-note]]
```

## add without --page stays flat (backward compatible)

### should create a root-level entry with an empty page

```execute
rm -rf .knowledge && aux4 kb add "Flat Topic" --content "# Flat\n\nA flat entry." --tags "flat"
```

```expect
Added: Flat Topic
```

### should not create any subfolder

```execute
ls .knowledge
```

```expect:partial
flat-topic.md
```

### should list the flat entry at the root

```execute
aux4 kb list
```

```expect:partial
| Flat Topic | flat-topic.md | flat |
```
