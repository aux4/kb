# kb page

```beforeAll
rm -rf .knowledge
aux4 kb add "Stub Recursion" --content "How stubbing recursion works." --page aux4-mock --section Recursion
aux4 kb add "Stub Basics" --content "Basics of stubs." --page aux4-mock --section Recursion
aux4 kb add "Loose Note" --content "A loose note." --page aux4-mock
```

```afterAll
rm -rf .knowledge
```

## assemble a page from its spine

### should inline each block body under the spine headings

```execute
aux4 kb page aux4-mock
```

```expect
# aux4-mock

## Recursion

How stubbing recursion works.
Basics of stubs.

## Blocks

A loose note.
```

## strip YAML frontmatter from block bodies

```beforeAll
rm -rf .knowledge
aux4 kb add "Front Matter Block" --content "placeholder" --page notes --section Intro
```

### should keep only the body when a block has frontmatter

```execute
printf -- '---\ntitle: Front Matter Block\ntags: demo\n---\n\nOnly this body should appear.\n' > .knowledge/notes/front-matter-block.md && aux4 kb page notes
```

```expect
# notes

## Intro

Only this body should appear.
```

## error handling

### should fail when the page folder does not exist

```execute
aux4 kb page nonexistent 2>&1; echo "exit:$?"
```

```expect:partial
Page not found: nonexistent
```

### should fail when a referenced block is missing

```execute
rm -f .knowledge/notes/front-matter-block.md && aux4 kb page notes 2>&1; echo "exit:$?"
```

```expect:partial
Block not found: front-matter-block (referenced in page notes)
```
