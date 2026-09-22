import {
  ArticleDetail,
  CategoryFilter,
  ChatRoom,
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

interface RequestOptions {
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'POST';
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: {
      accept: 'application/json',
      ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    method: options.method ?? 'GET',
    signal: options.signal,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
    const message = typeof body?.message === 'string' ? body.message : null;
    throw new Error(message ?? `뉴스 서버 요청에 실패했습니다. (${response.status})`);
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
  return request<ClusterListResponse>(`/clusters?${params.toString()}`, { signal });
}

export function getCluster(id: string, signal?: AbortSignal) {
  return request<NewsCluster>(`/clusters/${encodeURIComponent(id)}`, { signal });
}

export function getArticle(id: string, signal?: AbortSignal) {
  return request<ArticleDetail>(`/articles/${encodeURIComponent(id)}`, { signal });
}

export function getChatRooms(clientId: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ clientId });
  return request<ChatRoom[]>(`/chat/rooms?${query.toString()}`, { signal });
}

export function getChatRoom(clientId: string, clusterId: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ clientId });
  return request<ChatRoom>(`/chat/clusters/${encodeURIComponent(clusterId)}?${query.toString()}`, {
    signal,
  });
}

export function postChatMessage(clientId: string, clusterId: string, message: string) {
  return request<ChatRoom>(`/chat/clusters/${encodeURIComponent(clusterId)}/messages`, {
    body: { clientId, message },
    method: 'POST',
  });
}

export function deleteChatRoom(clientId: string, clusterId: string) {
  const query = new URLSearchParams({ clientId });
  return request<{ deleted: boolean }>(
    `/chat/clusters/${encodeURIComponent(clusterId)}?${query.toString()}`,
    { method: 'DELETE' },
  );
}
