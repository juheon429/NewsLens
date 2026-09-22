import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { shouldGenerateNews } from './generation-policy';
import { buildNewsGenerationPrompt } from './news-generation.prompt';
import { parseNewsGenerationResponse } from './news-generation.response';

interface GroundingSource {
  title: string;
  url: string;
}

interface GroundingResponse {
  candidates?: Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: { title?: string; uri?: string };
      }>;
    };
  }>;
}

@Injectable()
export class NewsGenerationService {
  private readonly logger = new Logger(NewsGenerationService.name);
  private client: GoogleGenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generatePending() {
    const lookbackHours = Number(this.config.get<string>('CLUSTER_LOOKBACK_HOURS') ?? '48');
    const clusters = await this.prisma.newsCluster.findMany({
      where: {
        status: 'ACTIVE',
        lastPublishedAt: { gte: new Date(Date.now() - lookbackHours * 3_600_000) },
      },
      orderBy: { lastPublishedAt: 'desc' },
      select: { id: true },
    });
    let generated = 0;
    let failed = 0;

    for (const cluster of clusters) {
      try {
        if (await this.generateIfNeeded(cluster.id)) generated += 1;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`AI 뉴스 생성 실패: cluster=${cluster.id}, ${message}`);
      }
    }

    return { generated, failed };
  }

  async generateIfNeeded(clusterId: string) {
    const cluster = await this.prisma.newsCluster.findUnique({
      where: { id: clusterId },
      select: {
        id: true,
        articleCount: true,
        publisherCount: true,
        generatedAt: true,
        generatedArticleCount: true,
        generatedPublisherCount: true,
      },
    });
    if (!cluster || !shouldGenerateNews(cluster)) return false;

    const articles = await this.prisma.article.findMany({
      where: { clusterId, status: 'CLUSTERED' },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, cleanDescription: true },
    });
    const generated = await this.generate(articles);

    await this.prisma.newsCluster.update({
      where: { id: clusterId },
      data: {
        aiTitle: generated.title,
        aiBriefing: generated.briefing,
        category: generated.category,
        briefingSources: generated.sources as unknown as Prisma.InputJsonValue,
        generatedAt: new Date(),
        generatedArticleCount: cluster.articleCount,
        generatedPublisherCount: cluster.publisherCount,
      },
    });
    this.logger.log(`AI 뉴스 생성 완료: cluster=${clusterId}`);
    return true;
  }

  private async generate(articles: Array<{ title: string; cleanDescription: string | null }>) {
    const model = this.config.get<string>('GEMINI_GENERATION_MODEL') ?? 'gemini-3.8-flash';
    const response = await this.getClient().models.generateContent({
      model,
      contents: buildNewsGenerationPrompt(
        articles.map((article) => ({
          title: article.title,
          description: article.cleanDescription,
        })),
      ),
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: '18', maxLength: '32' },
            briefing: { type: 'string', minLength: '140', maxLength: '220' },
            category: {
              type: 'string',
              enum: ['정치', '경제', '사회', '문화', '세계', '기술/IT', '연예', '스포츠'],
            },
          },
          required: ['title', 'briefing', 'category'],
        },
      },
    });
    const parsed = parseNewsGenerationResponse(response.text ?? '');
    const sources = this.extractSources(response as GroundingResponse);
    return { ...parsed, sources };
  }

  private extractSources(response: GroundingResponse) {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = chunks.flatMap((chunk): GroundingSource[] => {
      const title = chunk.web?.title?.trim();
      const url = chunk.web?.uri?.trim();
      return title && url ? [{ title, url }] : [];
    });
    return [...new Map(sources.map((source) => [source.url, source])).values()];
  }

  private getClient() {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }
}
