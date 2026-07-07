<<<<<<< HEAD
import { BlockCache, createMemoryCacheStorage } from '../src';

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
=======
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
>>>>>>> 8ab6f64f96cb251f9c83b6778a50eb68bb95d3f5
});

console.log(result);
console.log(await bc.urls());
console.log(await bc.get(['Repo Table', 'recW04x5fQfsSeQ1c', 'fields', 'Attachment', 'filename']));
