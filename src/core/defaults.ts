import type { CacheStorageLike, StorageManagerLike } from './types.ts';

interface AirtableBaseLike {
  id?: string;
}

interface GlobalWithAirtableBase {
  base?: AirtableBaseLike;
  caches?: CacheStorageLike;
  navigator?: {
    storage?: StorageManagerLike;
  };
}

export function getGlobalCacheStorage(): CacheStorageLike | undefined {
  return (globalThis as GlobalWithAirtableBase).caches;
}

export function getGlobalStorageManager(): StorageManagerLike | undefined {
  return (globalThis as GlobalWithAirtableBase).navigator?.storage;
}

export function getGlobalAirtableBaseId(): string | undefined {
  return (globalThis as GlobalWithAirtableBase).base?.id;
}

export function resolveCurrentBaseId(input?: string | (() => string | undefined)): string | undefined {
  if (typeof input === 'function') {
    return input();
  }

  if (typeof input === 'string') {
    return input;
  }

  return getGlobalAirtableBaseId();
}
