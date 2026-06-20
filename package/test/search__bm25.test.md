# kb search BM25 ranking

The search command ranks entries with BM25 across title/topic, tags, and body
(title and tags weighted higher than body). Queries are tokenized and stemmed,
so morphological variants of a word match a single stem.

```beforeAll
rm -rf .knowledge
aux4 kb add "response style preference" --content "Prefers concise, bullet-point answers" --tags "preferences"
aux4 kb add "Deployment Notes" --content "Deploy the service to production using the release pipeline." --tags "deploy,ops"
aux4 kb add "Caching Strategy" --content "Cache responses for repeated queries to reduce latency." --tags "performance"
```

```afterAll
rm -rf .knowledge
```

## should find an entry by its title and stemmed body when querying "preference"

The query word `preference` does not appear verbatim in the body
("Prefers concise, bullet-point answers"), but matches the title
"response style preference" and the stemmed body word "Prefers".

```execute
aux4 kb search "preference"
```

```expect:partial
response-style-preference.md
```

## should match the entry body context for the preference query

```execute
aux4 kb search "preference"
```

```expect:partial
Prefers concise, bullet-point answers
```

## should find an entry by a tag word

The query `preferences` matches the entry's tag, not its body.

```execute
aux4 kb search "preferences"
```

```expect:partial
response-style-preference.md
```

## should find an entry by a body word

```execute
aux4 kb search "bullet"
```

```expect:partial
response-style-preference.md
```

## should rank the most relevant entry first

A query for "deploy production" is most relevant to the Deployment Notes
entry (matches title-ish topic, tag, and body), which must appear before
any weaker match.

```execute
aux4 kb search "deploy production"
```

```expect:partial
## deployment-notes.md
**
```

## should still return no matches for an unknown term

```execute
aux4 kb search "kubernetes"
```

```expect
No matches found.
```
