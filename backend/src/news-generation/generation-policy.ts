interface GenerationState {
  articleCount: number;
  publisherCount: number;
  generatedAt: Date | null;
  generatedArticleCount: number | null;
  generatedPublisherCount: number | null;
}

const HOUR = 60 * 60 * 1000;

export function shouldGenerateNews(
  state: GenerationState,
  now = new Date(),
) {
  if (!state.generatedAt) {
    return state.articleCount >= 3 || state.publisherCount >= 2;
  }

  const elapsed = now.getTime() - state.generatedAt.getTime();
  if (elapsed < HOUR) return false;

  const newArticles = state.articleCount - (state.generatedArticleCount ?? 0);
  const newPublishers = state.publisherCount - (state.generatedPublisherCount ?? 0);
  if (newArticles < 1) return false;

  return newArticles >= 3 || newPublishers >= 2 || elapsed >= 3 * HOUR;
}
