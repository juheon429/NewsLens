import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewsCategory, Prisma } from '@prisma/client';

import { parseVector, toVectorLiteral } from '../embedding/vector';
import { PrismaService } from '../prisma/prisma.service';
import { updateCentroid } from './centroid';

interface ArticleForClustering {
  id: string;
  publisher: string;
  category: NewsCategory;
  imageUrl: string | null;
  publishedAt: Date;
}

interface CandidateRow {
  id: string;
  centroidSimilarity: number;
  articleSimilarity: number;
}

interface DuplicateRow {
  id: string;
  similarity: number;
}

interface LockedClusterRow {
  clusterEmbedding: string;
  articleCount: number;
}

interface CountRow {
  count: number;
}

interface CategoryRow {
  category: NewsCategory;
  count: number;
}

interface AssignedClusteringResult {
  duplicate: false;
  clusterId: string;
  created: boolean;
  similarity: number | null;
  articleCount: number;
  publisherCount: number;
}

interface DuplicateClusteringResult {
  duplicate: true;
  duplicateOf: string;
  similarity: number;
}

export type ClusteringResult = AssignedClusteringResult | DuplicateClusteringResult;

@Injectable()
export class ClusteringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async assign(article: ArticleForClustering, embedding: number[]): Promise<ClusteringResult> {
    const vector = toVectorLiteral(embedding);
    const candidateThreshold = this.readThreshold('CLUSTER_SIMILARITY_THRESHOLD');
    const articleThreshold = this.readThreshold('CLUSTER_ARTICLE_SIMILARITY_THRESHOLD');
    const duplicateThreshold = this.readThreshold('ARTICLE_DUPLICATE_SIMILARITY_THRESHOLD');
    const cutoff = new Date(Date.now() - this.readLookbackHours() * 60 * 60 * 1000);

    const duplicateRows = await this.prisma.$queryRaw<DuplicateRow[]>(Prisma.sql`
      SELECT
        article."id",
        (1 - (article."embedding" <=> ${vector}::vector))::double precision AS "similarity"
      FROM "Article" AS article
      JOIN "NewsCluster" AS cluster ON cluster."id" = article."clusterId"
      WHERE article."id" <> ${article.id}::uuid
        AND article."publisher" = ${article.publisher}
        AND article."status" = 'CLUSTERED'
        AND article."publishedAt" >= ${cutoff}
        AND article."embedding" IS NOT NULL
        AND cluster."status" = 'ACTIVE'
      ORDER BY article."embedding" <=> ${vector}::vector
      LIMIT 1
    `);
    const duplicate = duplicateRows[0];
    if (duplicate && duplicate.similarity >= duplicateThreshold) {
      await this.prisma.article.delete({ where: { id: article.id } });
      return {
        duplicate: true,
        duplicateOf: duplicate.id,
        similarity: duplicate.similarity,
      };
    }

    const candidates = await this.prisma.$queryRaw<CandidateRow[]>(Prisma.sql`
      WITH candidates AS (
        SELECT
          "id",
          (1 - ("clusterEmbedding" <=> ${vector}::vector))::double precision
            AS "centroidSimilarity"
        FROM "NewsCluster"
        WHERE "status" = 'ACTIVE'
          AND "lastPublishedAt" >= ${cutoff}
        ORDER BY "clusterEmbedding" <=> ${vector}::vector
        LIMIT 5
      )
      SELECT
        candidates."id",
        candidates."centroidSimilarity",
        nearest."articleSimilarity"
      FROM candidates
      CROSS JOIN LATERAL (
        SELECT
          (1 - ("embedding" <=> ${vector}::vector))::double precision
            AS "articleSimilarity"
        FROM "Article"
        WHERE "clusterId" = candidates."id"
          AND "status" = 'CLUSTERED'
          AND "embedding" IS NOT NULL
        ORDER BY "embedding" <=> ${vector}::vector
        LIMIT 1
      ) AS nearest
      WHERE candidates."centroidSimilarity" >= ${candidateThreshold}
        AND nearest."articleSimilarity" >= ${articleThreshold}
      ORDER BY nearest."articleSimilarity" DESC, candidates."centroidSimilarity" DESC
      LIMIT 1
    `);
    const candidate = candidates[0];

    if (!candidate) {
      return this.createCluster(article, vector);
    }
    return this.addToCluster(article, embedding, candidate);
  }

  private async createCluster(
    article: ArticleForClustering,
    vector: string,
  ): Promise<ClusteringResult> {
    const clusterId = randomUUID();
    await this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw(Prisma.sql`
        INSERT INTO "NewsCluster" (
          "id", "category", "imageUrl", "clusterEmbedding", "articleCount",
          "publisherCount", "lastPublishedAt", "status", "createdAt", "updatedAt"
        ) VALUES (
          ${clusterId}::uuid,
          ${article.category}::"NewsCategory",
          ${article.imageUrl},
          ${vector}::vector,
          1,
          1,
          ${article.publishedAt},
          'ACTIVE'::"ClusterStatus",
          NOW(),
          NOW()
        )
      `);
      await transaction.article.update({
        where: { id: article.id },
        data: { clusterId, status: 'CLUSTERED', processingError: null },
      });
    });

    return {
      duplicate: false,
      clusterId,
      created: true,
      similarity: null,
      articleCount: 1,
      publisherCount: 1,
    };
  }

  private async addToCluster(
    article: ArticleForClustering,
    embedding: number[],
    candidate: CandidateRow,
  ): Promise<ClusteringResult> {
    const counts = await this.prisma.$transaction(async (transaction) => {
      const locked = await transaction.$queryRaw<LockedClusterRow[]>(Prisma.sql`
        SELECT
          "clusterEmbedding"::text AS "clusterEmbedding",
          "articleCount"
        FROM "NewsCluster"
        WHERE "id" = ${candidate.id}::uuid
        FOR UPDATE
      `);
      const cluster = locked[0];
      if (!cluster) throw new Error('선택한 NewsCluster를 찾을 수 없습니다.');

      const nextEmbedding = updateCentroid(
        parseVector(cluster.clusterEmbedding),
        cluster.articleCount,
        embedding,
      );
      await transaction.article.update({
        where: { id: article.id },
        data: {
          clusterId: candidate.id,
          status: 'CLUSTERED',
          processingError: null,
        },
      });

      const [publisherCountRows, categoryRows] = await Promise.all([
        transaction.$queryRaw<CountRow[]>(Prisma.sql`
          SELECT COUNT(DISTINCT "publisher")::int AS "count"
          FROM "Article"
          WHERE "clusterId" = ${candidate.id}::uuid
        `),
        transaction.$queryRaw<CategoryRow[]>(Prisma.sql`
          SELECT "category", COUNT(*)::int AS "count"
          FROM "Article"
          WHERE "clusterId" = ${candidate.id}::uuid
          GROUP BY "category"
          ORDER BY "count" DESC, "category" ASC
          LIMIT 1
        `),
      ]);
      const publisherCount = publisherCountRows[0]?.count ?? 1;
      const category = categoryRows[0]?.category ?? article.category;
      const articleCount = cluster.articleCount + 1;

      await transaction.$executeRaw(Prisma.sql`
        UPDATE "NewsCluster"
        SET
          "clusterEmbedding" = ${toVectorLiteral(nextEmbedding)}::vector,
          "articleCount" = ${articleCount},
          "publisherCount" = ${publisherCount},
          "category" = ${category}::"NewsCategory",
          "imageUrl" = CASE
            WHEN ${article.publishedAt} >= "lastPublishedAt"
              THEN COALESCE(${article.imageUrl}, "imageUrl")
            ELSE "imageUrl"
          END,
          "lastPublishedAt" = GREATEST("lastPublishedAt", ${article.publishedAt}),
          "updatedAt" = NOW()
        WHERE "id" = ${candidate.id}::uuid
      `);

      return { articleCount, publisherCount };
    });

    return {
      duplicate: false,
      clusterId: candidate.id,
      created: false,
      similarity: candidate.articleSimilarity,
      ...counts,
    };
  }

  private readThreshold(key: string) {
    const rawValue = this.config.get<string>(key)?.trim();
    const threshold = rawValue ? Number(rawValue) : Number.NaN;
    if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
      throw new Error(`${key}를 0 초과 1 이하로 설정해야 합니다.`);
    }
    return threshold;
  }

  private readLookbackHours() {
    const hours = Number(this.config.get<string>('CLUSTER_LOOKBACK_HOURS') ?? '48');
    if (!Number.isInteger(hours) || hours < 24 || hours > 48) {
      throw new Error('CLUSTER_LOOKBACK_HOURS는 24~48 사이의 정수여야 합니다.');
    }
    return hours;
  }
}
