import { Module } from '@nestjs/common';

import { ArticlesModule } from '../articles/articles.module';
import { NewsGenerationModule } from '../news-generation/news-generation.module';
import { RssCollectorService } from './rss-collector.service';
import { RssParserService } from './rss-parser.service';
import { RssSchedulerService } from './rss-scheduler.service';

@Module({
  imports: [ArticlesModule, NewsGenerationModule],
  providers: [RssParserService, RssCollectorService, RssSchedulerService],
  exports: [RssCollectorService],
})
export class RssModule {}
