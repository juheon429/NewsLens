import { validateEnvironment } from './environment';

describe('환경변수 검증', () => {
  const enabledConfig = {
    DATABASE_URL: 'postgresql://db',
    RSS_SCHEDULER_ENABLED: 'true',
    GEMINI_API_KEY: 'test-key',
    CLUSTER_SIMILARITY_THRESHOLD: '0.82',
    CLUSTER_ARTICLE_SIMILARITY_THRESHOLD: '0.86',
    ARTICLE_DUPLICATE_SIMILARITY_THRESHOLD: '0.98',
  };

  it('RSS 수집 활성화 시 Gemini 키와 threshold를 요구한다', () => {
    expect(() => validateEnvironment({ DATABASE_URL: 'postgresql://db', RSS_SCHEDULER_ENABLED: 'true' })).toThrow('GEMINI_API_KEY');
  });

  it('개별 기사 유사도 기준을 검증한다', () => {
    expect(() => validateEnvironment({
      ...enabledConfig,
      CLUSTER_ARTICLE_SIMILARITY_THRESHOLD: '1.1',
    })).toThrow('CLUSTER_ARTICLE_SIMILARITY_THRESHOLD');
  });

  it('기사 중복 기준을 검증한다', () => {
    expect(() => validateEnvironment({
      ...enabledConfig,
      ARTICLE_DUPLICATE_SIMILARITY_THRESHOLD: '0',
    })).toThrow('ARTICLE_DUPLICATE_SIMILARITY_THRESHOLD');
  });

  it('RSS 수집을 끄면 DB 설정만으로 API를 시작할 수 있다', () => {
    expect(validateEnvironment({ DATABASE_URL: 'postgresql://db', RSS_SCHEDULER_ENABLED: 'false' })).toMatchObject({ DATABASE_URL: 'postgresql://db' });
  });
});
