# kb add

```afterAll
rm -rf .knowledge test-content.md
```

## add and verify

### should add a new entry

```execute
rm -rf .knowledge && aux4 kb add "Test Topic" --content "# Test\n\nThis is a test entry." --tags "test,example"
```

```expect
Added: Test Topic
```

### should create the entry file

```execute
cat .knowledge/test-topic.md
```

```expect
# Test

This is a test entry.
```

### should update the index

```execute
aux4 kb list
```

```expect:partial
Test Topic
```

### should include tags in the index

```execute
aux4 kb list
```

```expect:partial
test,example
```

### should fail if topic already exists

```execute
aux4 kb add "Test Topic" --content "duplicate" 2>&1; echo "exit:$?"
```

```expect:partial
Entry already exists: Test Topic
```

## add from file

```file:test-content.md
# From File

Content loaded from a file.
```

### should add entry from file

```execute
rm -rf .knowledge && aux4 kb add "File Topic" --file test-content.md --tags "file"
```

```expect
Added: File Topic
```

## validation

### should fail without content

```execute
aux4 kb add "Empty Topic" 2>&1; echo "exit:$?"
```

```expect:partial
Content is required
```
