import type { CacheLike, CacheStorageLike } from '../../core/types.ts';

function normalizeRequestUrl(input: RequestInfo | URL): string {
  if (input instanceof Request) {
    return input.url;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return new Request(input).url;
}

export class InMemoryCache implements CacheLike {
  private readonly entries = new Map<string, Response>();

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    this.entries.set(normalizeRequestUrl(request), response.clone());
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    const response = this.entries.get(normalizeRequestUrl(request));
    return response?.clone();
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    return this.entries.delete(normalizeRequestUrl(request));
  }

  async keys(): Promise<readonly Request[]> {
    return [...this.entries.keys()].map((url) => new Request(url));
  }
}

export class InMemoryCacheStorage implements CacheStorageLike {
  private readonly caches = new Map<string, InMemoryCache>();

  async open(cacheName: string): Promise<CacheLike> {
    const existing = this.caches.get(cacheName);

    if (existing) {
      return existing;
    }

    const cache = new InMemoryCache();
    this.caches.set(cacheName, cache);

    return cache;
  }

  async keys(): Promise<string[]> {
    return [...this.caches.keys()];
  }

  async delete(cacheName: string): Promise<boolean> {
    return this.caches.delete(cacheName);
  }
}

export function createMemoryCacheStorage(): CacheStorageLike {
  return new InMemoryCacheStorage();
}
