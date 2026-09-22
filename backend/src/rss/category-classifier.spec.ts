import { NewsCategory } from '@prisma/client';

import { classifyCategory } from './category-classifier';

describe('프런트 표시용 분야 분류', () => {
  it('RSS category 값을 우선적인 분류 단서로 사용한다', () => {
    expect(
      classifyCategory({ categories: ['경제'], title: '새 소식', description: null, url: 'https://example.com/a' }),
    ).toBe(NewsCategory.ECONOMY);
  });

  it('category가 없으면 URL과 제목, 설명에서 분야를 찾는다', () => {
    expect(
      classifyCategory({ categories: [], title: 'AI 반도체 투자 확대', description: null, url: 'https://example.com/news' }),
    ).toBe(NewsCategory.TECH);
  });

  it('스포츠 기사를 별도 분야로 분류한다', () => {
    expect(
      classifyCategory({ categories: ['스포츠'], title: '프로야구 경기 결과', description: null, url: 'https://example.com/sports' }),
    ).toBe(NewsCategory.SPORTS);
  });

  it('분류 단서가 없으면 사회 분야로 분류한다', () => {
    expect(
      classifyCategory({ categories: [], title: '새로운 소식', description: null, url: 'https://example.com/news' }),
    ).toBe(NewsCategory.SOCIETY);
  });
});
