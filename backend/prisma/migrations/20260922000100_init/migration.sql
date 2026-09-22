CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "ArticleStatus" AS ENUM ('DISCOVERED', 'CLUSTERED', 'FAILED');
CREATE TYPE "ClusterStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "NewsCategory" AS ENUM ('POLITICS', 'ECONOMY', 'SOCIETY', 'CULTURE', 'WORLD', 'TECH', 'ENTERTAINMENT');

CREATE TABLE "NewsCluster" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "aiTitle" TEXT,
  "aiBriefing" TEXT,
  "briefingSources" JSONB,
  "generatedAt" TIMESTAMP(3),
  "generatedArticleCount" INTEGER,
  "generatedPublisherCount" INTEGER,
  "category" "NewsCategory" NOT NULL,
  "imageUrl" TEXT,
  "clusterEmbedding" vector(768) NOT NULL,
  "articleCount" INTEGER NOT NULL DEFAULT 0,
  "publisherCount" INTEGER NOT NULL DEFAULT 0,
  "lastPublishedAt" TIMESTAMP(3) NOT NULL,
  "status" "ClusterStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsCluster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Article" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "dedupKey" TEXT NOT NULL,
  "publisher" TEXT NOT NULL,
  "guid" TEXT,
  "url" TEXT NOT NULL,
  "canonicalUrl" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "rawDescription" TEXT,
  "cleanDescription" TEXT,
  "imageUrl" TEXT,
  "category" "NewsCategory" NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "embedding" vector(768),
  "status" "ArticleStatus" NOT NULL DEFAULT 'DISCOVERED',
  "processingError" TEXT,
  "clusterId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Article_dedupKey_key" ON "Article"("dedupKey");
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");
CREATE INDEX "Article_clusterId_idx" ON "Article"("clusterId");
CREATE INDEX "Article_publisher_guid_idx" ON "Article"("publisher", "guid");
CREATE INDEX "Article_category_publishedAt_idx" ON "Article"("category", "publishedAt");
CREATE INDEX "NewsCluster_status_lastPublishedAt_idx" ON "NewsCluster"("status", "lastPublishedAt");
CREATE INDEX "NewsCluster_category_lastPublishedAt_idx" ON "NewsCluster"("category", "lastPublishedAt");
CREATE INDEX "NewsCluster_clusterEmbedding_hnsw_idx" ON "NewsCluster" USING hnsw ("clusterEmbedding" vector_cosine_ops);

ALTER TABLE "Article"
  ADD CONSTRAINT "Article_clusterId_fkey"
  FOREIGN KEY ("clusterId") REFERENCES "NewsCluster"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
