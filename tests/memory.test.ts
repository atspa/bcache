import { BlockCache, createMemoryCacheStorage } from '../src/index.ts';

const cacheStorage = createMemoryCacheStorage();
const bc = await BlockCache.open({
  cacheName: 'app-dev-cache',
  cacheStorage,
});

const result = await bc.upsert(['Repo Table', 'recW04x5fQfsSeQ1c'], {
  fields: {
    Attachment: {
      id: 'att1',
      filename: 'cdnPackageMetadata.mjs',
      raw: {
        utf8: 'export const ok = true;',
      },
    },
  },
});

console.log(result);
console.log(await bc.urls());
console.log(await bc.get(['Repo Table', 'recW04x5fQfsSeQ1c', 'fields', 'Attachment', 'filename']));
