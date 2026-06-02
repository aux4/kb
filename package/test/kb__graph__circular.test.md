# kb graph circular references

## circular loop

```beforeAll
rm -rf .knowledge
```

```afterAll
rm -rf .knowledge
```

### should create a circular chain A → B → C → A

```execute
aux4 kb add "Alpha" --content "# Alpha\n\nLinks to [Beta](beta.md)." && aux4 kb add "Beta" --content "# Beta\n\nLinks to [Gamma](gamma.md)." && aux4 kb add "Gamma" --content "# Gamma\n\nLinks back to [Alpha](alpha.md)." && aux4 kb graph
```

```expect:partial
alpha --> beta
```

### should include all edges in the cycle

```execute
aux4 kb graph
```

```expect:partial
beta --> gamma
```

### should close the cycle

```execute
aux4 kb graph
```

```expect:partial
gamma --> alpha
```

### should show backrefs through the cycle

```execute
aux4 kb backrefs "Alpha"
```

```expect:partial
Gamma
```

### should show refs through the cycle

```execute
aux4 kb refs "Alpha"
```

```expect:partial
Beta
```

## self reference

```beforeAll
rm -rf .knowledge
```

```afterAll
rm -rf .knowledge
```

### should handle self-referencing page

```execute
aux4 kb add "Self" --content "# Self\n\nLinks to [itself](self.md)." && aux4 kb graph "Self"
```

```expect:partial
self --> self
```

### should show self in refs

```execute
aux4 kb refs "Self"
```

```expect:partial
Self
```

### should show self in backrefs

```execute
aux4 kb backrefs "Self"
```

```expect:partial
Self
```

## mutual reference

```beforeAll
rm -rf .knowledge
```

```afterAll
rm -rf .knowledge
```

### should handle two pages referencing each other

```execute
aux4 kb add "Ping" --content "# Ping\n\nSee [Pong](pong.md)." && aux4 kb add "Pong" --content "# Pong\n\nSee [Ping](ping.md)." && aux4 kb graph
```

```expect:partial
ping --> pong
```

### should show reverse edge

```execute
aux4 kb graph
```

```expect:partial
pong --> ping
```

### should show backrefs for mutual link

```execute
aux4 kb backrefs "Ping"
```

```expect:partial
Pong
```
