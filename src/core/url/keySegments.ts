import type { CacheKeyInput } from '../types.ts';

export function toSegments(key: CacheKeyInput): string[] {
  if (key instanceof Request) {
    return new URL(key.url).pathname.split('/').filter(Boolean).map(decodeURIComponent);
  }

  if (key instanceof URL) {
    return key.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  }

  if (Array.isArray(key)) {
    return key.map((part) => String(part));
  }

  if (typeof key === 'string') {
    return key
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  throw new TypeError('Cache key must be a string, segment array, Request, or URL.');
}
