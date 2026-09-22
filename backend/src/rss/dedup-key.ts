import { createHash } from 'node:crypto';

export function createDedupKey(
  publisher: string,
  guid: string | null,
  canonicalUrl: string,
) {
  const sourceKey = guid?.trim() ? `guid:${guid.trim()}` : `url:${canonicalUrl}`;
  return createHash('sha256')
    .update(`${publisher}\u0000${sourceKey}`)
    .digest('hex');
}
