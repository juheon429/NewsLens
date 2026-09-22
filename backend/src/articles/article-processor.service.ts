import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ClusteringService } from '../clustering/clustering.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { toVectorLiteral } from '../embedding/vector';
import { PrismaService } from '../prisma/prisma.service';
import { ParsedRssArticle } from '../rss/rss.types';

export type ArticleProcessResult = 'processed' | 'duplicate';

@Injectable()
export class ArticleProcessorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
    private readonly clustering: ClusteringService,
  ) {}

  async process(input: ParsedRssArticle): Promise<ArticleProcessResult> {
    const existing = await this.prisma.article.findUnique({
      where: { dedupKey: input.dedupKey },
    });
    if (existing?.status === 'CLUSTERED') return 'duplicate';

    const article = existing
      ? await this.prisma.article.update({
          where: { id: existing.id },
          data: {
            title: input.title,
            url: input.url,
            canonicalUrl: input.canonicalUrl,
            rawDescription: input.rawDescription,
            cleanDescription: input.cleanDescription,
            imageUrl: input.imageUrl,
            category: input.category,
            publishedAt: input.publishedAt,
            status: 'DISCOVERED',
            processingError: null,
          },
        })
      : await this.createArticle(input);

    try {
      const vector = await this.embedding.create(
        article.title,
        article.cleanDescription,
      );
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE "Article"
        SET "embedding" = ${toVectorLiteral(vector)}::vector, "updatedAt" = NOW()
        WHERE "id" = ${article.id}::uuid
      `);
      const clustering = await this.clustering.assign(
        {
          id: article.id,
          publisher: article.publisher,
          category: article.category,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
        },
        vector,
      );
      if (clustering.duplicate) return 'duplicate';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.prisma.article.update({
        where: { id: article.id },
        data: { status: 'FAILED', processingError: message.slice(0, 2000) },
      });
      throw error;
    }

    return 'processed';
  }

  private async createArticle(input: ParsedRssArticle) {
    try {
      return await this.prisma.article.create({
        data: {
          dedupKey: input.dedupKey,
          publisher: input.publisher,
          guid: input.guid,
          url: input.url,
          canonicalUrl: input.canonicalUrl,
          title: input.title,
          rawDescription: input.rawDescription,
          cleanDescription: input.cleanDescription,
          imageUrl: input.imageUrl,
          category: input.category,
          publishedAt: input.publishedAt,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return this.prisma.article.findUniqueOrThrow({
          where: { dedupKey: input.dedupKey },
        });
      }
      throw error;
    }
  }
}
