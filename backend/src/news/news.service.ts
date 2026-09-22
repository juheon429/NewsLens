import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CATEGORY_LABELS, parseCategoryLabel } from './category-label';
import { ageInHours, formatPublishedLabel } from './time-label';

interface ClusterQuery {
  category?: string;
  period?: string;
  query?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findClusters(query: ClusterQuery) {
    const now = new Date();
    const page = this.readInteger(query.page, 1, 1, 10_000);
    const limit = this.readInteger(query.limit, 10, 1, 10);
    const category = parseCategoryLabel(query.category);
    const where: Prisma.NewsClusterWhereInput = {
      status: 'ACTIVE',
      aiTitle: { not: null },
      aiBriefing: { not: null },
      lastPublishedAt: { gte: new Date(now.getTime() - this.periodHours(query.period) * 3_600_000) },
      ...(category ? { category } : {}),
      ...(query.query?.trim()
        ? { aiTitle: { contains: query.query.trim(), mode: 'insensitive' } }
        : {}),
    };
    const [clusters, total] = await this.prisma.$transaction([
      this.prisma.newsCluster.findMany({
        where,
        orderBy: [
          { publisherCount: 'desc' },
          { articleCount: 'desc' },
          { lastPublishedAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          aiTitle: true,
          aiBriefing: true,
          category: true,
          imageUrl: true,
          articleCount: true,
          publisherCount: true,
          lastPublishedAt: true,
        },
      }),
      this.prisma.newsCluster.count({ where }),
    ]);

    return {
      items: clusters.map((cluster) => ({
        id: cluster.id,
        representativeTitle: cluster.aiTitle,
        summary: cluster.aiBriefing,
        category: CATEGORY_LABELS[cluster.category],
        imageUrl: cluster.imageUrl,
        articleCount: cluster.articleCount,
        publisherCount: cluster.publisherCount,
        publishedAt: cluster.lastPublishedAt.toISOString(),
        publishedLabel: formatPublishedLabel(cluster.lastPublishedAt, now),
        ageInHours: ageInHours(cluster.lastPublishedAt, now),
      })),
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
    };
  }

  async findCluster(id: string) {
    const cluster = await this.prisma.newsCluster.findUnique({
      where: { id },
      select: {
        id: true,
        aiTitle: true,
        aiBriefing: true,
        briefingSources: true,
        category: true,
        imageUrl: true,
        articleCount: true,
        publisherCount: true,
        lastPublishedAt: true,
        articles: {
          where: { status: 'CLUSTERED' },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            cleanDescription: true,
            publisher: true,
            publishedAt: true,
            url: true,
          },
        },
      },
    });
    if (!cluster?.aiTitle || !cluster.aiBriefing) {
      throw new NotFoundException('뉴스 묶음을 찾을 수 없습니다.');
    }

    const now = new Date();
    return {
      id: cluster.id,
      representativeTitle: cluster.aiTitle,
      summary: cluster.aiBriefing,
      category: CATEGORY_LABELS[cluster.category],
      imageUrl: cluster.imageUrl,
      articleCount: cluster.articleCount,
      publisherCount: cluster.publisherCount,
      publishedAt: cluster.lastPublishedAt.toISOString(),
      publishedLabel: formatPublishedLabel(cluster.lastPublishedAt, now),
      ageInHours: ageInHours(cluster.lastPublishedAt, now),
      sources: cluster.briefingSources ?? [],
      articles: cluster.articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.cleanDescription ?? '',
        publisher: article.publisher,
        publishedAt: article.publishedAt.toISOString(),
        publishedLabel: formatPublishedLabel(article.publishedAt, now),
        url: article.url,
      })),
    };
  }

  async findArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        cleanDescription: true,
        publisher: true,
        publishedAt: true,
        url: true,
        cluster: {
          select: { id: true, aiTitle: true },
        },
      },
    });
    if (!article) throw new NotFoundException('기사를 찾을 수 없습니다.');
    return {
      id: article.id,
      title: article.title,
      description: article.cleanDescription ?? '',
      publisher: article.publisher,
      publishedAt: article.publishedAt.toISOString(),
      publishedLabel: formatPublishedLabel(article.publishedAt),
      url: article.url,
      cluster: article.cluster
        ? {
            id: article.cluster.id,
            representativeTitle: article.cluster.aiTitle,
          }
        : null,
    };
  }

  private periodHours(value: string | undefined) {
    if (value === 'week' || value === '1주일' || value === '7d') return 168;
    if (value === 'two-weeks' || value === '2주일' || value === '14d') return 336;
    return 24;
  }

  private readInteger(value: string | undefined, fallback: number, min: number, max: number) {
    const parsed = Number(value ?? fallback);
    if (!Number.isInteger(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  }
}
