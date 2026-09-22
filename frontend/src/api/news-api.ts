import {
  ArticleDetail,
  CategoryFilter,
  ClusterListResponse,
  NewsCluster,
  NewsPeriod,
} from '@/types/news';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api').replace(
  /\/$/,
  '',
);

interface ClusterListQuery {
  category: CategoryFilter;
  period: NewsPeriod;
  query: string;
  page?: number;
  limit?: number;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`뉴스 서버 요청에 실패했습니다. (${response.status})`);
  }

  return (await response.json()) as T;
}

export function getClusters(query: ClusterListQuery, signal?: AbortSignal) {
  const params = new URLSearchParams({
    category: query.category,
    period: query.period,
    query: query.query.trim(),
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 10),
  });
  return request<ClusterListResponse>(`/clusters?${params.toString()}`, signal);
}

export function getCluster(id: string, signal?: AbortSignal) {
  return request<NewsCluster>(`/clusters/${encodeURIComponent(id)}`, signal);
}

export function getArticle(id: string, signal?: AbortSignal) {
  return request<ArticleDetail>(`/articles/${encodeURIComponent(id)}`, signal);
}
