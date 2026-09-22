import { RssParserService } from './rss-parser.service';

describe('RSS parser', () => {
  const parser = new RssParserService();

  it('언론사 RSS item을 공통 Article 구조로 변환한다', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <channel>
          <item>
            <title><![CDATA[한국은행, 기준금리 동결]]></title>
            <link>https://example.com/article/1?utm_source=rss</link>
            <guid>article-1</guid>
            <description><![CDATA[<img src="https://example.com/a.jpg">금통위가 기준금리를 유지했습니다.]]></description>
            <category>경제</category>
            <pubDate>Tue, 22 Sep 2026 12:00:00 +0900</pubDate>
          </item>
        </channel>
      </rss>`;
    const [article] = parser.parse({ publisher: '테스트뉴스', url: 'https://example.com/rss' }, xml);

    expect(article).toMatchObject({
      publisher: '테스트뉴스',
      guid: 'article-1',
      canonicalUrl: 'https://example.com/article/1',
      title: '한국은행, 기준금리 동결',
      cleanDescription: '금통위가 기준금리를 유지했습니다.',
      imageUrl: 'https://example.com/a.jpg',
      category: 'ECONOMY',
    });
    expect(article.dedupKey).toHaveLength(64);
  });
});
