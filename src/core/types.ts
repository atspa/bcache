export type PrimitiveCacheKey = string | number | boolean | bigint | symbol | null | undefined;
export type CacheKeyInput = string | readonly PrimitiveCacheKey[] | Request | URL;

export interface CacheLike {
  put(request: RequestInfo | URL, response: Response): Promise<void>;
  match(request: RequestInfo | URL): Promise<Response | undefined>;
  delete(request: RequestInfo | URL): Promise<boolean>;
  keys(request?: RequestInfo | URL): Promise<readonly Request[]>;
}

export interface CacheStorageLike {
  open(cacheName: string): Promise<CacheLike>;
  keys(): Promise<string[]>;
  delete(cacheName: string): Promise<boolean>;
}

export interface StorageEstimateLike {
  quota?: number;
  usage?: number;
}

export interface StorageManagerLike {
  estimate(): Promise<StorageEstimateLike>;
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

export interface StorageSnapshot {
  estimate: StorageEstimateLike | null;
  cacheKeys: string[];
  quotaBytes: number;
  usageBytes: number;
  quotaMB: string;
  usageMB: string;
  quotaGB: string;
  usageGB: string;
}

export interface BlockCacheOpenOptions {
  cacheName?: string;
  virtualOrigin?: string;
  includeCacheNameInUrl?: boolean;
  cacheStorage?: CacheStorageLike;
  storageManager?: StorageManagerLike;
  currentBaseId?: string | (() => string | undefined);
}

export interface BlockCacheConstructorOptions {
  cacheName: string;
  virtualOrigin: string | undefined;
  includeCacheNameInUrl: boolean | undefined;
  cacheStorage: CacheStorageLike;
  storageManager: StorageManagerLike | undefined;
}

export interface UpsertOptions {
  /** Recursively store nested leaf values. Defaults to true. */
  walk?: boolean;

  /** Also store the supplied root object itself. Defaults to false. */
  storeRoot?: boolean;
}

export interface WalkEntry {
  segments: string[];
  value: unknown;
}

export interface UpsertResult {
  cacheName: string;
  count: number;
  urls: string[];
  keys: string[][];
  storage: Omit<StorageSnapshot, 'estimate' | 'cacheKeys'>;
}
