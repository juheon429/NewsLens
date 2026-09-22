import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { buildEmbeddingInput } from './embedding-input';
import { normalizeVector } from './vector';

@Injectable()
export class EmbeddingService {
  private client: GoogleGenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  async create(title: string, description: string | null) {
    const model = this.config.get<string>('GEMINI_EMBEDDING_MODEL') ?? 'gemini-embedding-001';
    const dimension = this.readDimension();
    const input = buildEmbeddingInput(title, description);
    const contents = model.includes('embedding-2')
      ? `같은 뉴스 사건을 군집화할 수 있도록 다음 한국어 기사를 표현하세요.\n\n${input}`
      : input;
    const config = model.includes('embedding-2')
      ? { outputDimensionality: dimension }
      : { outputDimensionality: dimension, taskType: 'SEMANTIC_SIMILARITY' as const };

    const response = await this.getClient().models.embedContent({
      model,
      contents,
      config,
    });
    const values = response.embeddings?.[0]?.values;
    if (!values || values.length !== dimension) {
      throw new Error(`Gemini Embedding 차원이 ${dimension}과 일치하지 않습니다.`);
    }
    return normalizeVector(values);
  }

  private getClient() {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }

  private readDimension() {
    const dimension = Number(this.config.get<string>('EMBEDDING_DIMENSION') ?? '768');
    if (dimension !== 768) {
      throw new Error('현재 DB vector 차원은 768로 고정되어 있습니다.');
    }
    return dimension;
  }
}
