import { Injectable, Logger } from '@nestjs/common';

import { ArticleProcessorService } from '../articles/article-processor.service';
import { NewsGenerationService } from '../news-generation/news-generation.service';
import { RssParserService } from './rss-parser.service';
import { RSS_SOURCES } from './rss-sources';
import { ParsedRssArticle, RssSource } from './rss.types';

interface CollectionSummary {
  fetched: number;
  processed: number;
  duplicates: number;
  failed: number;
  generated: number;
  generationFailed: number;
}

@Injectable()
export class RssCollectorService {
  private readonly logger = new Logger(RssCollectorService.name);

  constructor(
    private readonly parser: RssParserService,
    private readonly articleProcessor: ArticleProcessorService,
    private readonly newsGeneration: NewsGenerationService,
  ) {}

  async collectAll(): Promise<CollectionSummary> {
    const downloaded = await Promise.allSettled(
      RSS_SOURCES.map(async (source) => ({
        source,
        xml: await this.download(source),
      })),
    );
    const articles: ParsedRssArticle[] = [];
    let failed = 0;

    for (const result of downloaded) {
      if (result.status === 'rejected') {
        failed += 1;
        this.logger.error(`RSS 수신 실패: ${String(result.reason)}`);
        continue;
      }
      try {
        articles.push(...this.parser.parse(result.value.source, result.value.xml));
      } catch (error) {
        failed += 1;
        this.logger.error(
          `RSS 파싱 실패: ${result.value.source.publisher}, ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    articles.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
    let processed = 0;
    let duplicates = 0;
    for (const article of articles) {
      try {
        const result = await this.articleProcessor.process(article);
        if (result === 'duplicate') duplicates += 1;
        else processed += 1;
      } catch (error) {
        failed += 1;
        this.logger.error(
          `기사 처리 실패: ${article.publisher} / ${article.title} / ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const generation = await this.newsGeneration.generatePending();
    const summary = {
      fetched: articles.length,
      processed,
      duplicates,
      failed,
      generated: generation.generated,
      generationFailed: generation.failed,
    };
    this.logger.log(`RSS 수집 완료: ${JSON.stringify(summary)}`);
    return summary;
  }

  private async download(source: RssSource) {
    const response = await fetch(source.url, {
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml, */*',
        'user-agent': 'NewsLens RSS Collector/0.1',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      throw new Error(`${source.publisher} RSS HTTP ${response.status}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const header = response.headers.get('content-type') ?? '';
    const declaration = new TextDecoder('ascii').decode(bytes.slice(0, 200));
    const encoding = /euc[-_]?kr|ks_c_5601-1987/i.test(`${header} ${declaration}`)
      ? 'euc-kr'
      : 'utf-8';
    return new TextDecoder(encoding).decode(bytes).replace(/^\uFEFF/, '');
  }
}
