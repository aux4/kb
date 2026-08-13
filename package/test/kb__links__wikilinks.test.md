# kb links wikilinks

```beforeAll
rm -rf .knowledge
aux4 kb add "Stub Basics" --content "Basics of stubs." --page aux4-mock --section Recursion
aux4 kb add "Stub Advanced" --content "Advanced stubbing builds on [[stub-basics]]." --page aux4-mock --section Recursion
```

```afterAll
rm -rf .knowledge
```

## refs recognize [[slug]] wikilinks resolved to the page

### should list the page-resolved reference

```execute
aux4 kb refs "Stub Advanced"
```

```expect
References from Stub Advanced:
  → Stub Basics
```

## backrefs resolve wikilinks across the page

### should show the block that wikilinks to it

```execute
aux4 kb backrefs "Stub Basics"
```

```expect:partial
Stub Advanced
```

## links graph includes wikilink edges

### should record the wikilink as an edge in the graph

```execute
aux4 kb links --render json
```

```expect:partial
      "from": "aux4-mock/stub-advanced.md",
      "to": "aux4-mock/stub-basics.md",
```

## links --missing detects dangling wikilinks

```beforeAll
rm -rf .knowledge
aux4 kb add "Dangling" --content "Points to [[does-not-exist]] block." --page aux4-mock --section Recursion
```

### should report the missing wikilink target

```execute
aux4 kb links --missing
```

```expect:partial
aux4-mock/does-not-exist.md
```
