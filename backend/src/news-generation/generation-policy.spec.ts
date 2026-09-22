import { shouldGenerateNews } from './generation-policy';

const now = new Date('2026-09-22T12:00:00.000Z');

describe('AI 뉴스 생성 조건', () => {
  it('최초 생성은 기사 3개 또는 언론사 2개부터 허용한다', () => {
    expect(shouldGenerateNews({ articleCount: 3, publisherCount: 1, generatedAt: null, generatedArticleCount: null, generatedPublisherCount: null }, now)).toBe(true);
    expect(shouldGenerateNews({ articleCount: 1, publisherCount: 2, generatedAt: null, generatedArticleCount: null, generatedPublisherCount: null }, now)).toBe(true);
    expect(shouldGenerateNews({ articleCount: 2, publisherCount: 1, generatedAt: null, generatedArticleCount: null, generatedPublisherCount: null }, now)).toBe(false);
  });

  it('마지막 생성 후 1시간 이내에는 재생성하지 않는다', () => {
    expect(shouldGenerateNews({ articleCount: 10, publisherCount: 5, generatedAt: new Date('2026-09-22T11:30:01.000Z'), generatedArticleCount: 3, generatedPublisherCount: 2 }, now)).toBe(false);
  });

  it('새 기사 3개 또는 새 언론사 2개가 추가되면 재생성한다', () => {
    expect(shouldGenerateNews({ articleCount: 6, publisherCount: 2, generatedAt: new Date('2026-09-22T10:00:00.000Z'), generatedArticleCount: 3, generatedPublisherCount: 2 }, now)).toBe(true);
    expect(shouldGenerateNews({ articleCount: 4, publisherCount: 4, generatedAt: new Date('2026-09-22T10:00:00.000Z'), generatedArticleCount: 3, generatedPublisherCount: 2 }, now)).toBe(true);
  });

  it('3시간이 지난 뒤 새 기사가 있으면 재생성한다', () => {
    expect(shouldGenerateNews({ articleCount: 4, publisherCount: 2, generatedAt: new Date('2026-09-22T08:59:00.000Z'), generatedArticleCount: 3, generatedPublisherCount: 2 }, now)).toBe(true);
    expect(shouldGenerateNews({ articleCount: 3, publisherCount: 2, generatedAt: new Date('2026-09-22T08:59:00.000Z'), generatedArticleCount: 3, generatedPublisherCount: 2 }, now)).toBe(false);
  });
});
