/// <reference lib="ESNext" />
/// <reference lib="WebWorker" />

const { BlockCache } = await import("https://esm.sh/gh/atspa/bcache");

await BlockCache.refreshStatics();

const bcsResult = {
    cacheKeys: BlockCache.cacheKeys,
    quotaBytes: BlockCache.quotaBytes,
    usageBytes: BlockCache.usageBytes,
    quotaMB: BlockCache.quotaMB,
    usageMB: BlockCache.usageMB,
    quotaGB: BlockCache.quotaGB,
    usageGB: BlockCache.usageGB,
};

console.debug(bcsResult);

export default bcsResult;