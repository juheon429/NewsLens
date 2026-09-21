export type NewsCategory =
  | '정치'
  | '경제'
  | '사회'
  | '문화'
  | '세계'
  | '기술/IT'
  | '연예';

export type CategoryFilter = '전체' | NewsCategory;

export interface Article {
  id: string;
  title: string;
  description: string;
  publisher: string;
  publishedLabel: string;
  url: string;
}

export interface NewsCluster {
  id: string;
  representativeTitle: string;
  summary: string;
  category: NewsCategory;
  imageUrl: string;
  articleCount: number;
  publisherCount: number;
  publishedLabel: string;
  ageInHours: number;
  articles: Article[];
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
  isBriefing?: boolean;
}

export interface ChatRoom {
  clusterId: string;
  title: string;
  category: NewsCategory;
  updatedAt: number;
  updatedLabel: string;
  messages: ChatMessage[];
}
