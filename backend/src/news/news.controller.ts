import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { NewsService } from './news.service';

@Controller()
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get('clusters')
  findClusters(
    @Query('category') category?: string,
    @Query('period') period?: string,
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.news.findClusters({ category, period, query, page, limit });
  }

  @Get('clusters/:id')
  findCluster(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.news.findCluster(id);
  }

  @Get('articles/:id')
  findArticle(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.news.findArticle(id);
  }
}
