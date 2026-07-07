export interface VirtualUrlOptions {
  cacheName: string;
  virtualOrigin: string;
  includeCacheNameInUrl: boolean;
}

export function makeVirtualUrl(segments: readonly string[], options: VirtualUrlOptions): string {
  const allSegments = options.includeCacheNameInUrl
    ? [options.cacheName, ...segments]
    : [...segments];

  const pathname = `/${allSegments
    .filter((segment) => segment !== '')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

  return new URL(pathname, options.virtualOrigin).href;
}
