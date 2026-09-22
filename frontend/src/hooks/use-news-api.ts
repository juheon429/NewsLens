import { useCallback, useEffect, useState } from 'react';

import { getArticle, getCluster, getClusters } from '@/api/news-api';
import {
  ArticleDetail,
  CategoryFilter,
  ClusterListResponse,
  NewsCluster,
  NewsPeriod,
} from '@/types/news';

interface RequestState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

interface SettledRequest<T> {
  key: string;
  data: T | null;
  error: string | null;
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : '뉴스를 불러오지 못했습니다.';
}

export function useClusterList(input: {
  category: CategoryFilter;
  period: NewsPeriod;
  query: string;
  page: number;
}): RequestState<ClusterListResponse> {
  const { category, period, query, page } = input;
  const [settled, setSettled] = useState<SettledRequest<ClusterListResponse> | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const requestKey = `${category}|${period}|${query}|${page}|${revision}`;

  useEffect(() => {
    const controller = new AbortController();

    getClusters({ category, period, query, page, limit: 10 }, controller.signal)
      .then((data) => setSettled({ key: requestKey, data, error: null }))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setSettled({ key: requestKey, data: null, error: readError(requestError) });
        }
      });

    return () => controller.abort();
  }, [category, period, query, page, requestKey]);

  const current = settled?.key === requestKey ? settled : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: !current,
    reload,
  };
}

export function useCluster(id: string | undefined): RequestState<NewsCluster> {
  const [settled, setSettled] = useState<SettledRequest<NewsCluster> | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const requestKey = `${id ?? ''}|${revision}`;

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    getCluster(id, controller.signal)
      .then((data) => setSettled({ key: requestKey, data, error: null }))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setSettled({ key: requestKey, data: null, error: readError(requestError) });
        }
      });

    return () => controller.abort();
  }, [id, requestKey]);

  if (!id) {
    return { data: null, error: '뉴스를 찾을 수 없습니다.', loading: false, reload };
  }
  const current = settled?.key === requestKey ? settled : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: !current,
    reload,
  };
}

export function useArticle(id: string | undefined): RequestState<ArticleDetail> {
  const [settled, setSettled] = useState<SettledRequest<ArticleDetail> | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const requestKey = `${id ?? ''}|${revision}`;

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    getArticle(id, controller.signal)
      .then((data) => setSettled({ key: requestKey, data, error: null }))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setSettled({ key: requestKey, data: null, error: readError(requestError) });
        }
      });

    return () => controller.abort();
  }, [id, requestKey]);

  if (!id) {
    return { data: null, error: '기사를 찾을 수 없습니다.', loading: false, reload };
  }
  const current = settled?.key === requestKey ? settled : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: !current,
    reload,
  };
}
