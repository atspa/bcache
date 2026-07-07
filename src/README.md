# BlockCache

A small native TypeScript module that wraps the browser `CacheStorage` API for Airtable Scripting Extension-style workflows.

It defaults to opening a cache named after the current Airtable `base.id`, but it can also run in Node with an injected `CacheStorage`-compatible adapter.

## Structure

```txt
src/
  index.ts
  core/
    BlockCache.ts
    types.ts
    defaults.ts
    serialization/
    storage/
    url/
    walk/
  adapters/
    memory/
```

## Airtable usage

```ts
import { BlockCache } from './src/index.ts';

const bc = await BlockCache.open();

await bc.upsert(['Repo Table', 'recW04x5fQfsSeQ1c'], {
  fields: {
    Attachment: att,
  },
});

console.log(BlockCache.cacheKeys);
console.log(BlockCache.quotaMB, BlockCache.usageMB);
```

## Node usage with the included memory adapter

```ts
import { BlockCache, createMemoryCacheStorage } from './src/index.ts';

const cacheStorage = createMemoryCacheStorage();

const bc = await BlockCache.open({
  cacheName: 'app-dev-cache',
  cacheStorage,
});

await bc.upsert(['Repo Table', 'rec1'], {
  fields: {
    Name: 'Example',
  },
});

console.log(await bc.urls());
```

Run the included example with a recent Node version that supports native TypeScript stripping:

```sh
npm run example:memory
```

## Notes

- Cache keys are stored as absolute synthetic URLs because `Cache.put()` cannot use arbitrary relative paths.
- `quota*` and `usage*` values come from `navigator.storage.estimate()` when available. They are origin-level estimates, not exact per-cache byte counts.
- GB calculations use `1024 ** 3`.
