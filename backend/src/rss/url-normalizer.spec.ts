import { canonicalizeUrl } from './url-normalizer';

describe('기사 URL 정규화', () => {
  it('추적 파라미터와 fragment를 제거하고 쿼리를 정렬한다', () => {
    expect(
      canonicalizeUrl('https://EXAMPLE.com/news/?utm_source=rss&b=2&a=1#top'),
    ).toBe('https://example.com/news?a=1&b=2');
  });
});
