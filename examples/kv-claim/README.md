# kv-claim — conditional writes and expiring keys via `context.kv`

A **TypeScript** function that races for a claim on a key. `claim` creates the key with the caller's holder only
while the key is absent; `renew` replaces it only while it is at the version the caller holds; `release` deletes it
only then. A `ttl` (whole seconds) makes the key expire, so a crashed holder's claim ends. Of racing callers exactly
one wins; each loser learns the current holder and version.

```ts
const v = await ctx.kv.putIfAbsent('claims', key, holder, { ttl: 30 });  // PUT If-None-Match: *  → version | null
await ctx.kv.compareAndSet('claims', key, holder, v, { ttl: 30 });       // PUT If-Match: "<v>" → version | null
await ctx.kv.delIf('claims', key, v);                                     // DELETE If-Match     → boolean
const e = await ctx.kv.getEntry('claims', key);                           // GET → { value, version } | null
```

The Python sibling `pyclaim` (funcd-python `examples/kv-claim`) writes the same table through a writer role; funcd's
`kv-claim` lane races the two.
