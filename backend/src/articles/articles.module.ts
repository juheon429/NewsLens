import { Module } from '@nestjs/common';

import { ClusteringModule } from '../clustering/clustering.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { ArticleProcessorService } from './article-processor.service';

@Module({
  imports: [EmbeddingModule, ClusteringModule],
  providers: [ArticleProcessorService],
  exports: [ArticleProcessorService],
})
export class ArticlesModule {}
