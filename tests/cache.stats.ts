/// <reference lib="ESNext" />
/// <reference lib="WebWorker" />

import { BlockCache } from "../src/index.ts";

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

export default bcsResult;
