export function validateEnvironment(config: Record<string, unknown>) {
  const databaseUrl = String(config.DATABASE_URL ?? '').trim();
  if (!databaseUrl) throw new Error('DATABASE_URL이 설정되지 않았습니다.');

  const schedulerEnabled = String(config.RSS_SCHEDULER_ENABLED ?? 'true').toLowerCase() === 'true';
  if (schedulerEnabled) {
    const apiKey = String(config.GEMINI_API_KEY ?? '').trim();
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');

    validateThreshold(config, 'CLUSTER_SIMILARITY_THRESHOLD');
    validateThreshold(config, 'CLUSTER_ARTICLE_SIMILARITY_THRESHOLD');
    validateThreshold(config, 'ARTICLE_DUPLICATE_SIMILARITY_THRESHOLD');
  }

  const dimension = Number(config.EMBEDDING_DIMENSION ?? 768);
  if (dimension !== 768) throw new Error('EMBEDDING_DIMENSION은 768이어야 합니다.');

  const lookback = Number(config.CLUSTER_LOOKBACK_HOURS ?? 48);
  if (!Number.isInteger(lookback) || lookback < 24 || lookback > 48) {
    throw new Error('CLUSTER_LOOKBACK_HOURS는 24~48 사이의 정수여야 합니다.');
  }

  return config;
}

function validateThreshold(config: Record<string, unknown>, key: string) {
  const threshold = Number(config[key]);
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
    throw new Error(`${key}를 0 초과 1 이하로 설정해야 합니다.`);
  }
}
