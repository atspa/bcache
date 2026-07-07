import type { CacheStorageLike, StorageManagerLike, StorageSnapshot } from '../types.ts';

export function bytesToMB(bytes: number): string {
  return (bytes / 1024 ** 2).toFixed(2);
}

export function bytesToGB(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(4);
}

export async function readStorageSnapshot(
  cacheStorage: CacheStorageLike,
  storageManager?: StorageManagerLike,
): Promise<StorageSnapshot> {
  const cacheKeys = await cacheStorage.keys();
  const estimate = storageManager ? await storageManager.estimate() : null;

  const quotaBytes = Number(estimate?.quota ?? 0);
  const usageBytes = Number(estimate?.usage ?? 0);

  return {
    estimate,
    cacheKeys,
    quotaBytes,
    usageBytes,
    quotaMB: bytesToMB(quotaBytes),
    usageMB: bytesToMB(usageBytes),
    quotaGB: bytesToGB(quotaBytes),
    usageGB: bytesToGB(usageBytes),
  };
}
