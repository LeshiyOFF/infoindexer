/**
 * Hook для загрузки данных организаций
 *
 * @remarks
 * Отвечает за fetching данных с API, обработку ошибок и управление состоянием загрузки.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthHeaders } from '@/lib/api';
import type { CompanyMeta } from 'shared/client';
import {
  REVENUE_MAX,
  AGE_MAX,
  PAGE_LIMIT,
  MIN_LOADING_TIME_MS
} from '@/lib/organizations.constants';

/** Параметры для загрузки данных */
export interface FetchDataParams {
  page: number;
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  regionFilter: string;
  okvedFilter: string;
  minRevenue: number;
  maxRevenue: number;
  minAge: number;
  maxAge: number;
  hasGeoFilter: boolean;
  hasDirectorFilter: boolean;
  hasNameFilter: boolean;
}

/** Результат пагинации */
export interface PaginationResult {
  total: number;
  limit: number;
  totalPages: number;
}

/**
 * Строит параметры запроса из фильтров
 */
function buildQueryParams(params: FetchDataParams): URLSearchParams {
  const queryParams: Record<string, string> = {
    page: params.page.toString(),
    limit: PAGE_LIMIT.toString(),
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    region: params.regionFilter,
    okved: params.okvedFilter,
    hasGeo: params.hasGeoFilter ? 'true' : '',
    minRevenue: params.minRevenue > 0 ? params.minRevenue.toString() : '',
    maxRevenue: params.maxRevenue < REVENUE_MAX ? params.maxRevenue.toString() : '',
    minAge: params.minAge > 0 ? params.minAge.toString() : '',
    maxAge: params.maxAge < AGE_MAX ? params.maxAge.toString() : '',
    hasDirector: params.hasDirectorFilter ? 'true' : '',
    hasName: params.hasNameFilter ? 'true' : ''
  };

  return new URLSearchParams(queryParams);
}

/**
 * Обрабатывает успешный ответ
 */
function processResponse(json: unknown): { data: CompanyMeta[]; pagination: PaginationResult } {
  const response = json as { data?: CompanyMeta[]; pagination?: PaginationResult; error?: string };
  return {
    data: response.data ? [...response.data] : [],
    pagination: response.pagination || { total: 0, limit: PAGE_LIMIT, totalPages: 0 }
  };
}

/**
 * Хук для загрузки данных организаций
 *
 * @param fetchParams — параметры для загрузки данных
 * @param onDataChange — опциональный callback при изменении данных
 * @returns Состояние данных и функции управления
 */
export function useOrganizationsData(fetchParams: FetchDataParams, onDataChange?: () => void) {
  const [data, setData] = useState<CompanyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationResult>({ total: 0, limit: PAGE_LIMIT, totalPages: 0 });

  const fetchIdRef = useRef(0);
  const paramsRef = useRef(fetchParams);

  // Обновляем ref при изменении параметров
  useEffect(() => {
    paramsRef.current = fetchParams;
  }, [fetchParams]);

  /**
   * Загружает данные с API
   */
  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      const id = ++fetchIdRef.current;
      const start = Date.now();
      const params = paramsRef.current;

      setLoading(true);

      try {
        const queryString = buildQueryParams(params).toString();
        const res = await fetch(`/api/organizations?${queryString}`, {
          cache: 'no-store',
          signal,
          headers: getAuthHeaders()
        });

        const json = await res.json();

        // Проверяем актуальность запроса
        if (id !== fetchIdRef.current || signal?.aborted) return;

        if (!res.ok || json.error) {
          setData([]);
          setPagination({ total: 0, limit: PAGE_LIMIT, totalPages: 0 });
          return;
        }

        const { data: newData, pagination: newPagination } = processResponse(json);
        setData(newData);
        setPagination(newPagination);
      } catch (e) {
        // Игнорируем AbortError
        if ((e as DOMException)?.name === 'AbortError') return;
        if (id !== fetchIdRef.current) return;

        console.error(e);
        setData([]);
      } finally {
        if (id === fetchIdRef.current && !signal?.aborted) {
          const elapsed = Date.now() - start;
          // Минимальное время загрузки для UI
          if (elapsed < MIN_LOADING_TIME_MS) {
            await new Promise(r => setTimeout(r, MIN_LOADING_TIME_MS - elapsed));
          }
          setLoading(false);
        }
      }
    },
    []
  );

  /**
   * Эффект для загрузки данных при изменении параметров
   */
  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);
    return () => ac.abort();
  }, [fetchData]);

  /**
   * Обработка сортировки
   */
  const handleSort = useCallback(
    (field: string, currentSortBy: string, currentSortOrder: 'ASC' | 'DESC', onSortChange: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void) => {
      if (currentSortBy === field) {
        onSortChange(field, currentSortOrder === 'ASC' ? 'DESC' : 'ASC');
      } else {
        onSortChange(field, 'DESC');
      }
      setLoading(true);
      onDataChange?.();
    },
    [onDataChange]
  );

  /**
   * Принудительное обновление данных
   */
  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    pagination,
    refresh,
    handleSort
  };
}
