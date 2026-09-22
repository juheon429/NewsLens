import { NewsCategory } from '@prisma/client';

import { parseCategoryLabel } from '../news/category-label';

export interface NewsGenerationResponse {
  title: string;
  briefing: string;
  category: NewsCategory;
}

export function parseNewsGenerationResponse(value: string): NewsGenerationResponse {
  const parsed = JSON.parse(value) as {
    title?: unknown;
    briefing?: unknown;
    category?: unknown;
  };

  if (typeof parsed.title !== 'string' || !parsed.title.trim()) {
    throw new Error('Gemini 응답에 유효한 대표 제목이 없습니다.');
  }
  if (typeof parsed.briefing !== 'string' || !parsed.briefing.trim()) {
    throw new Error('Gemini 응답에 유효한 브리핑이 없습니다.');
  }

  const category =
    typeof parsed.category === 'string' ? parseCategoryLabel(parsed.category.trim()) : undefined;
  if (!category) {
    throw new Error('Gemini 응답에 유효한 뉴스 분야가 없습니다.');
  }

  return {
    title: parsed.title.trim(),
    briefing: parsed.briefing.trim(),
    category,
  };
}
