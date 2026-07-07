import {
  getGlobalCacheStorage,
  getGlobalStorageManager,
  resolveCurrentBaseId,
} from './defaults.ts';
import { valueToResponse } from './serialization/valueToResponse.ts';
import { readStorageSnapshot } from './storage/storageStats.ts';
import type {
  BlockCacheConstructorOptions,
  BlockCacheOpenOptions,
  CacheKeyInput,
  CacheLike,
  CacheStorageLike,
  StorageEstimateLike,
  StorageManagerLike,
  UpsertOptions,
  UpsertResult,
  WalkEntry,
} from './types.ts';
import { toSegments } from './url/keySegments.ts';
import { makeVirtualUrl } from './url/virtualUrl.ts';
import { walkValue } from './walk/walkValue.ts';

export class BlockCache {
  static cacheKeys: string[] = [];
  static estimate: StorageEstimateLike | null = null;
  static quotaBytes = 0;
  static usageBytes = 0;
  static quotaMB = '0.00';
  static usageMB = '0.00';
  static quotaGB = '0.0000';
  static usageGB = '0.0000';
  static defaultVirtualOrigin = 'https://block-cache.local';

  readonly cacheName: string;
  readonly virtualOrigin: string;
  readonly includeCacheNameInUrl: boolean;
  readonly cacheStorage: CacheStorageLike;
  readonly storageManager: StorageManagerLike | undefined;

  private cache: CacheLike | null = null;

  static async open(options: BlockCacheOpenOptions = {}): Promise<BlockCache> {
    const cacheStorage = options.cacheStorage ?? getGlobalCacheStorage();

    if (!cacheStorage) {
      throw new Error(
        'BlockCache.open() needs CacheStorage. Pass options.cacheStorage or run in an environment with globalThis.caches.',
      );
    }

    const cacheName = options.cacheName ?? resolveCurrentBaseId(options.currentBaseId);

    if (!cacheName) {
      throw new Error('BlockCache.open() needs options.cacheName or a global Airtable base.id.');
    }

    const instance = new BlockCache({
      cacheName,
      cacheStorage,
      storageManager: options.storageManager ?? getGlobalStorageManager(),
      virtualOrigin: options.virtualOrigin,
      includeCacheNameInUrl: options.includeCacheNameInUrl,
    });

    instance.cache = await cacheStorage.open(cacheName);
    await BlockCache.refreshStatics(cacheStorage, instance.storageManager);

    return instance;
  }

  static async refreshStatics(
    cacheStorage: CacheStorageLike = getRequiredGlobalCacheStorage(),
    storageManager: StorageManagerLike | undefined = getGlobalStorageManager(),
  ): Promise<typeof BlockCache> {
    const snapshot = await readStorageSnapshot(cacheStorage, storageManager);

    BlockCache.cacheKeys = snapshot.cacheKeys;
    BlockCache.estimate = snapshot.estimate;
    BlockCache.quotaBytes = snapshot.quotaBytes;
    BlockCache.usageBytes = snapshot.usageBytes;
    BlockCache.quotaMB = snapshot.quotaMB;
    BlockCache.usageMB = snapshot.usageMB;
    BlockCache.quotaGB = snapshot.quotaGB;
    BlockCache.usageGB = snapshot.usageGB;

    return BlockCache;
  }

  constructor(options: BlockCacheConstructorOptions) {
    this.cacheName = options.cacheName;
    this.virtualOrigin = options.virtualOrigin ?? BlockCache.defaultVirtualOrigin;
    this.includeCacheNameInUrl = options.includeCacheNameInUrl ?? true;
    this.cacheStorage = options.cacheStorage;
    this.storageManager = options.storageManager;
  }

  async upsert(keyOrTree: CacheKeyInput | Record<PropertyKey, unknown>, value?: unknown, options: UpsertOptions = {}): Promise<UpsertResult> {
    const cache = this.requireCache();
    const walk = options.walk ?? true;
    const storeRoot = options.storeRoot ?? false;
    const entries: WalkEntry[] = [];

    if (arguments.length >= 2) {
      const baseSegments = toSegments(keyOrTree as CacheKeyInput);

      if (storeRoot) {
        entries.push({ segments: baseSegments, value });
      }

      if (walk) {
        walkValue(value, baseSegments, entries);
      } else {
        entries.push({ segments: baseSegments, value });
      }
    } else {
      if (storeRoot) {
        entries.push({ segments: [], value: keyOrTree });
      }

      if (!walk) {
        throw new Error(
          'BlockCache.upsert(tree) with walk:false is ambiguous. Use upsert(key, value, { walk:false }) instead.',
        );
      }

      walkValue(keyOrTree, [], entries);
    }

    const urls: string[] = [];
    const keys: string[][] = [];

    for (const entry of entries) {
      const url = this.virtualUrl(entry.segments);
      const request = new Request(url);
      const response = await valueToResponse(entry.value, entry.segments);

      await cache.put(request, response);

      urls.push(url);
      keys.push(entry.segments);
    }

    await BlockCache.refreshStatics(this.cacheStorage, this.storageManager);

    return {
      cacheName: this.cacheName,
      count: entries.length,
      urls,
      keys,
      storage: {
        quotaBytes: BlockCache.quotaBytes,
        usageBytes: BlockCache.usageBytes,
        quotaMB: BlockCache.quotaMB,
        usageMB: BlockCache.usageMB,
        quotaGB: BlockCache.quotaGB,
        usageGB: BlockCache.usageGB,
      },
    };
  }

  async match(key: CacheKeyInput): Promise<Response | undefined> {
    const cache = this.requireCache();
    return cache.match(this.virtualUrl(toSegments(key)));
  }

  async get(key: CacheKeyInput): Promise<unknown> {
    const response = await this.match(key);

    if (!response) {
      return undefined;
    }

    const contentType = response.headers.get('Content-Type') ?? '';

    if (contentType.includes('application/json')) {
      return response.json();
    }

    if (contentType.startsWith('text/')) {
      return response.text();
    }

    return response.blob();
  }

  async delete(key: CacheKeyInput): Promise<boolean> {
    const cache = this.requireCache();
    const ok = await cache.delete(this.virtualUrl(toSegments(key)));

    await BlockCache.refreshStatics(this.cacheStorage, this.storageManager);

    return ok;
  }

  async deleteCache(): Promise<boolean> {
    const ok = await this.cacheStorage.delete(this.cacheName);

    await BlockCache.refreshStatics(this.cacheStorage, this.storageManager);
    this.cache = null;

    return ok;
  }

  async keys(): Promise<readonly Request[]> {
    return this.requireCache().keys();
  }

  async urls(): Promise<string[]> {
    const requests = await this.keys();
    return requests.map((request) => request.url);
  }

  virtualUrl(segments: readonly string[]): string {
    return makeVirtualUrl(segments, {
      cacheName: this.cacheName,
      virtualOrigin: this.virtualOrigin,
      includeCacheNameInUrl: this.includeCacheNameInUrl,
    });
  }

  private requireCache(): CacheLike {
    if (!this.cache) {
      throw new Error('BlockCache is not open. Use `const bc = await BlockCache.open(...)`.');
    }

    return this.cache;
  }
}

function getRequiredGlobalCacheStorage(): CacheStorageLike {
  const cacheStorage = getGlobalCacheStorage();

  if (!cacheStorage) {
    throw new Error('No global CacheStorage available. Pass cacheStorage explicitly.');
  }

  return cacheStorage;
}
