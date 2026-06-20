# kb add concurrent

Two `kb add` processes may run at the same time (an agent batching two
`memory remember` / `kb add` tool calls in parallel). Each reads `index.json`,
adds its own entry, and writes it back. Without a cross-process lock this races:
both `.md` files are written but only one entry survives in `index.json`
(last-write-wins), leaving an orphaned entry that exists on disk and is found by
the BM25 file-scan but is missing from `kb list`. In the worst case the
interleaved writes corrupt `index.json` outright.

The whole parallel scenario runs inside one command: 50 `kb add` processes are
launched at once into the same folder, then the index is inspected. With the
cross-process file lock every entry survives, the index stays valid JSON, and no
lock file is left behind.

## parallel adds into the same folder

### should keep every concurrently-added entry in the index

```execute
rm -rf .kbc && PAD=$(node -e "process.stdout.write('x'.repeat(400))") && for i in $(seq 1 50); do aux4 kb add "Concurrent $i" --folder .kbc --content "body $i ${PAD}" --tags t >/dev/null 2>&1 & done; wait; MD=$(ls .kbc/*.md 2>/dev/null | wc -l | tr -d ' '); IDX=$(node -e "try{console.log(require('./.kbc/index.json').length)}catch(e){console.log('CORRUPT')}"); LIST=$(aux4 kb list --folder .kbc 2>/dev/null | grep -c '^| Concurrent '); LAST=$(aux4 kb list --folder .kbc 2>/dev/null | grep -c '^| Concurrent 50 '); LOCK=$(test -e .kbc/index.json.lock && echo present || echo absent); rm -rf .kbc; echo "md=${MD} idx=${IDX} list=${LIST} last=${LAST} lock=${LOCK}"
```

```expect
md=50 idx=50 list=50 last=1 lock=absent
```
