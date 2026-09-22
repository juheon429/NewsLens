import { NewsCategory } from '@prisma/client';

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  POLITICS: '정치',
  ECONOMY: '경제',
  SOCIETY: '사회',
  CULTURE: '문화',
  WORLD: '세계',
  TECH: '기술/IT',
  ENTERTAINMENT: '연예',
  SPORTS: '스포츠',
};

const categoriesByLabel = new Map(
  Object.entries(CATEGORY_LABELS).map(([category, label]) => [label, category as NewsCategory]),
);

export function parseCategoryLabel(value: string | undefined) {
  if (!value || value === '전체') return undefined;
  return categoriesByLabel.get(value);
}
