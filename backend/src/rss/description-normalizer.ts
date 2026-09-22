const entities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function decodeEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return entities[entity.toLowerCase()] ?? match;
  });
}

export function normalizeDescription(value: string | null | undefined) {
  if (!value) return null;

  const normalized = decodeEntities(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(script|style|table|figure)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(img|video|audio|iframe)[^>]*\/?\s*>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*\[[^\]]+\]\s*[^=]{0,40}기자\s*=\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || null;
}
