import { NewsCategory } from '@prisma/client';

interface CategoryInput {
  categories: string[];
  title: string;
  description: string | null;
  url: string;
}

const rules: Array<[NewsCategory, RegExp]> = [
  [NewsCategory.SPORTS, /스포츠|야구|축구|농구|배구|골프|테니스|올림픽|월드컵|프로야구|프로축구|sports|baseball|football|soccer|basketball|volleyball|golf|tennis/i],
  [NewsCategory.ENTERTAINMENT, /연예|방송|가요|아이돌|드라마|예능|스타|entertainment|k-pop/i],
  [NewsCategory.TECH, /기술\/it|과학|정보통신|인공지능|반도체|모바일|게임|테크|science|technology|\bit\b|digital/i],
  [NewsCategory.WORLD, /세계|국제|해외|미국|중국|일본|유럽|중동|international|world/i],
  [NewsCategory.POLITICS, /정치|국회|대통령|청와대|정당|선거|외교|통일|북한|politics/i],
  [NewsCategory.ECONOMY, /경제|금융|증권|산업|기업|부동산|환율|금리|주식|economy|business|finance|stock/i],
  [NewsCategory.CULTURE, /문화|생활|건강|여행|공연|전시|책|문학|종교|culture|lifestyle|travel/i],
  [NewsCategory.SOCIETY, /사회|사건|사고|법원|검찰|경찰|교육|노동|환경|날씨|전국|society|national/i],
];

export function classifyCategory(input: CategoryInput) {
  const source = [input.categories.join(' '), input.url, input.title, input.description ?? ''].join(' ');
  return rules.find(([, pattern]) => pattern.test(source))?.[0] ?? NewsCategory.SOCIETY;
}
