import { blockCacheJsonReplacer } from './jsonReplacer.ts';

export async function valueToResponse(value: unknown, path: readonly string[]): Promise<Response> {
  if (value instanceof Response) {
    return value.clone();
  }

  const headers = new Headers();
  headers.set('X-Block-Cache-Path', path.join('/'));
  headers.set('X-Block-Cache-Stored-At', new Date().toISOString());

  if (value instanceof Blob) {
    headers.set('Content-Type', value.type || 'application/octet-stream');
    return new Response(value, { headers });
  }

  if (value instanceof ArrayBuffer) {
    headers.set('Content-Type', 'application/octet-stream');
    return new Response(value, { headers });
  }

  if (ArrayBuffer.isView(value)) {
    headers.set('Content-Type', 'application/octet-stream');
    return new Response(value as BodyInit, { headers });
  }

  if (typeof value === 'string') {
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return new Response(value, { headers });
  }

  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(value, blockCacheJsonReplacer), { headers });
}
