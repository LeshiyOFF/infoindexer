/**
 * Утилиты для фильтров организаций
 */

import { useSearchParams } from 'next/navigation';
import { regionMap } from '@/lib/regions';
import {
  FILTERS_PERSIST_KEY,
  REVENUE_MAX,
  AGE_MAX
} from '@/lib/organizations.constants';

/** Параметры URL для синхронизации */
export interface UrlParams {
  page: number;
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  region: string;
  okved: string;
  minRevenue: number;
  maxRevenue: number;
  minAge: number;
  maxAge: number;
  hasGeo: boolean;
  hasDirector: boolean;
  hasName: boolean;
}

/**
 * Возвращает maxRevenue как number (обход литерального типа)
 */
function toNumber(val: number): number {
  return val;
}

/** Параметры по умолчанию */
export const defaultUrlParams: UrlParams = {
  page: 1,
  search: '',
  sortBy: 'records_count',
  sortOrder: 'DESC',
  region: '',
  okved: '',
  minRevenue: 0,
  maxRevenue: REVENUE_MAX as number,
  minAge: 0,
  maxAge: AGE_MAX as number,
  hasGeo: false,
  hasDirector: false,
  hasName: false
};

/**
 * Парсит начальное состояние из URL или sessionStorage
 */
export function parseInitialFilters(searchParams: ReturnType<typeof useSearchParams>): UrlParams {
  const fromUrl: UrlParams = {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || defaultUrlParams.sortBy,
    sortOrder: (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC',
    region: searchParams.get('region') || '',
    okved: searchParams.get('okved') || '',
    minRevenue: Math.max(0, Math.min(REVENUE_MAX, parseInt(searchParams.get('minRevenue') || '0') || 0)),
    maxRevenue: Math.max(0, Math.min(REVENUE_MAX, parseInt(searchParams.get('maxRevenue') || REVENUE_MAX.toString()) || REVENUE_MAX)),
    minAge: Math.max(0, Math.min(AGE_MAX, parseInt(searchParams.get('minAge') || '0') || 0)),
    maxAge: Math.max(0, Math.min(AGE_MAX, parseInt(searchParams.get('maxAge') || AGE_MAX.toString()) || AGE_MAX)),
    hasGeo: searchParams.get('hasGeo') === 'true',
    hasDirector: searchParams.get('hasDirector') === 'true',
    hasName: searchParams.get('hasName') === 'true'
  };

  if (searchParams.toString().length > 0) return fromUrl;

  try {
    const stored = sessionStorage.getItem(FILTERS_PERSIST_KEY);
    if (stored) {
      const p = JSON.parse(stored) as Record<string, unknown>;
      return {
        page: Math.max(1, Math.min(1000, Number(p.page) || 1)),
        search: typeof p.search === 'string' ? p.search : defaultUrlParams.search,
        sortBy: typeof p.sortBy === 'string' ? p.sortBy : defaultUrlParams.sortBy,
        sortOrder: (p.sortOrder === 'ASC' || p.sortOrder === 'DESC' ? p.sortOrder : defaultUrlParams.sortOrder) as 'ASC' | 'DESC',
        region: typeof p.region === 'string' ? p.region : defaultUrlParams.region,
        okved: typeof p.okved === 'string' ? p.okved : defaultUrlParams.okved,
        minRevenue: Math.max(0, Math.min(REVENUE_MAX, Number(p.minRevenue) ?? defaultUrlParams.minRevenue)),
        maxRevenue: Math.max(0, Math.min(REVENUE_MAX, Number(p.maxRevenue) ?? defaultUrlParams.maxRevenue)),
        minAge: Math.max(0, Math.min(AGE_MAX, Number(p.minAge) ?? defaultUrlParams.minAge)),
        maxAge: Math.max(0, Math.min(AGE_MAX, Number(p.maxAge) ?? defaultUrlParams.maxAge)),
        hasGeo: Boolean(p.hasGeo),
        hasDirector: Boolean(p.hasDirector),
        hasName: Boolean(p.hasName)
      };
    }
  } catch (e) {
    console.warn('Организации: ошибка sessionStorage/parse', e);
  }

  return fromUrl;
}

/**
 * Список регионов для селекта
 */
export function getRegionsList() {
  return Object.entries(regionMap)
    .map(([key, val]) => ({ id: key, name: val }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
