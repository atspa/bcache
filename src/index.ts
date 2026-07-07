export { BlockCache } from './core/BlockCache.ts';
export { createMemoryCacheStorage, InMemoryCache, InMemoryCacheStorage } from './adapters/memory/InMemoryCacheStorage.ts';

export type {
  BlockCacheConstructorOptions,
  BlockCacheOpenOptions,
  CacheKeyInput,
  CacheLike,
  CacheStorageLike,
  StorageEstimateLike,
  StorageManagerLike,
  StorageSnapshot,
  UpsertOptions,
  UpsertResult,
  WalkEntry,
} from './core/types.ts';

export { makeVirtualUrl } from './core/url/virtualUrl.ts';
export { toSegments } from './core/url/keySegments.ts';
export { walkValue } from './core/walk/walkValue.ts';
export { isPlainObject, shouldDescend } from './core/walk/valueGuards.ts';
export { valueToResponse } from './core/serialization/valueToResponse.ts';
export { blockCacheJsonReplacer } from './core/serialization/jsonReplacer.ts';
export { bytesToGB, bytesToMB, readStorageSnapshot } from './core/storage/storageStats.ts';
