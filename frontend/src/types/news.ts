export type NewsCategory =
  | '정치'
  | '경제'
  | '사회'
  | '문화'
  | '세계'
  | '기술/IT'
  | '연예'
  | '스포츠';

export type CategoryFilter = '전체' | NewsCategory;
export type NewsPeriod = '하루' | '1주일' | '2주일';

export interface Article {
  id: string;
  title: string;
  description: string;
  publisher: string;
  publishedAt?: string;
  publishedLabel: string;
  url: string;
}

export interface BriefingSource {
  title: string;
  url: string;
}

export interface NewsClusterSummary {
  id: string;
  representativeTitle: string;
  summary: string;
  category: NewsCategory;
  imageUrl: string | null;
  articleCount: number;
  publisherCount: number;
  publishedAt?: string;
  publishedLabel: string;
  ageInHours: number;
}

export interface NewsCluster extends NewsClusterSummary {
  articles: Article[];
  sources?: BriefingSource[];
}

export interface ClusterListResponse {
  items: NewsClusterSummary[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export interface ArticleDetail extends Article {
  cluster: {
    id: string;
    representativeTitle: string | null;
  } | null;
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
  updatedAt: string;
  updatedLabel: string;
  messages: ChatMessage[];
}
