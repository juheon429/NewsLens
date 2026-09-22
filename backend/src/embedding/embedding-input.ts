export function buildEmbeddingInput(title: string, description: string | null) {
  if (!description) return title.trim();
  return `제목: ${title.trim()}\n내용: ${description.trim()}`;
}
