import type { CompanyMeta } from '../../../interfaces';

/**
 * Параметры поиска организации
 */
export interface SearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  region?: string;
  hasGeo?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minAge?: number;
  maxAge?: number;
  minCharterCapital?: number;
  status?: string;
  hasDirector?: boolean;
  hasName?: boolean;
  okved?: string;
}

/**
 * Результат поиска
 */
export interface SearchResult {
  readonly data: CompanyMeta[];
  readonly total: number;
}

/**
 * Port для поиска организаций
 *
 * @remarks
 * Интерфейс (Port) в терминологии Hexagonal Architecture.
 * Определяет контракт для поиска организаций независимо от реализации.
 */
export interface IOrganizationSearch {
  /**
   * Выполняет поиск организаций
   *
   * @param params - Параметры поиска
   * @returns Результат поиска с данными и общим количеством
   */
  search(params: SearchParams): Promise<SearchResult>;
}
