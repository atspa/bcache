export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function shouldDescend(value: unknown): value is object {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  if (value instanceof Response) return false;
  if (value instanceof Request) return false;
  if (value instanceof Blob) return false;
  if (value instanceof Date) return false;
  if (value instanceof URL) return false;
  if (value instanceof RegExp) return false;
  if (value instanceof Error) return false;
  if (value instanceof ArrayBuffer) return false;
  if (ArrayBuffer.isView(value)) return false;

  if (Array.isArray(value)) return true;
  if (value instanceof Map) return true;
  if (value instanceof Set) return true;

  return isPlainObject(value);
}
