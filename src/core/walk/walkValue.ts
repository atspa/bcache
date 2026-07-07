import type { WalkEntry } from '../types.ts';
import { shouldDescend } from './valueGuards.ts';

export interface WalkOptions {
  onCircular?: 'throw' | 'store-marker';
}

export function walkValue(
  value: unknown,
  path: string[] = [],
  out: WalkEntry[] = [],
  active: WeakSet<object> = new WeakSet(),
  options: WalkOptions = {},
): WalkEntry[] {
  if (!shouldDescend(value)) {
    out.push({ segments: path, value });
    return out;
  }

  if (active.has(value)) {
    if (options.onCircular === 'store-marker') {
      out.push({
        segments: path,
        value: {
          __blockCacheType: 'CircularReference',
          path: path.join('/') || '<root>',
        },
      });
      return out;
    }

    throw new TypeError(`Circular reference at ${path.join('/') || '<root>'}`);
  }

  active.add(value);

  try {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        out.push({ segments: path, value: [] });
        return out;
      }

      value.forEach((item, index) => {
        walkValue(item, [...path, String(index)], out, active, options);
      });

      return out;
    }

    if (value instanceof Map) {
      if (value.size === 0) {
        out.push({ segments: path, value: {} });
        return out;
      }

      for (const [mapKey, mapValue] of value.entries()) {
        walkValue(mapValue, [...path, String(mapKey)], out, active, options);
      }

      return out;
    }

    if (value instanceof Set) {
      if (value.size === 0) {
        out.push({ segments: path, value: [] });
        return out;
      }

      let index = 0;

      for (const setValue of value.values()) {
        walkValue(setValue, [...path, String(index++)], out, active, options);
      }

      return out;
    }

    const keys = Reflect.ownKeys(value);

    if (keys.length === 0) {
      out.push({ segments: path, value: {} });
      return out;
    }

    for (const key of keys) {
      const segment = typeof key === 'symbol' ? key.description ?? String(key) : key;
      walkValue((value as Record<PropertyKey, unknown>)[key], [...path, segment], out, active, options);
    }

    return out;
  } finally {
    active.delete(value);
  }
}
