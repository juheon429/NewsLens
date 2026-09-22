export function updateCentroid(
  currentCentroid: number[],
  currentArticleCount: number,
  articleEmbedding: number[],
) {
  if (currentCentroid.length !== articleEmbedding.length || currentArticleCount < 1) {
    throw new Error('Cluster centroid를 갱신할 수 없습니다.');
  }

  const nextCount = currentArticleCount + 1;
  return currentCentroid.map(
    (value, index) =>
      (value * currentArticleCount + articleEmbedding[index]) / nextCount,
  );
}
