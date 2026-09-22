const removedParameters = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'plink',
  'cooper',
  'ref',
  'source',
]);

export function canonicalizeUrl(value: string) {
  const url = new URL(value.replace(/&amp;/g, '&').trim());
  url.hash = '';
  url.hostname = url.hostname.toLowerCase();

  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_') || removedParameters.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }

  url.searchParams.sort();
  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  return url.toString();
}
