export function blockCacheJsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return {
      __blockCacheType: 'BigInt',
      value: value.toString(),
    };
  }

  if (typeof value === 'undefined') {
    return {
      __blockCacheType: 'Undefined',
    };
  }

  if (typeof value === 'function') {
    return {
      __blockCacheType: 'Function',
      value: value.toString(),
    };
  }

  if (typeof value === 'symbol') {
    return {
      __blockCacheType: 'Symbol',
      value: value.description ?? String(value),
    };
  }

  if (value instanceof URL) {
    return {
      __blockCacheType: 'URL',
      value: value.href,
    };
  }

  if (value instanceof Error) {
    return {
      __blockCacheType: 'Error',
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}
