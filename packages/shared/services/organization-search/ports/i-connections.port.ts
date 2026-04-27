import type { CompanyMeta } from '../../../interfaces';

/**
 * Параметры для поиска связанных организаций
 */
export interface ConnectionQueryParams {
  readonly director: string;
  readonly founders: readonly string[];
  readonly inn: string;
}

/**
 * Port для поиска связанных организаций
 *
 * @remarks
 * Интерфейс (Port) в терминологии Hexagonal Architecture.
 */
export interface IConnections {
  /**
   * Находит организации, связанные через директора или учредителей
   *
   * @param params - Параметры для поиска связей
   * @returns Массив связанных компаний
   */
  findByDirectorOrFounders(params: ConnectionQueryParams): Promise<Partial<CompanyMeta>[]>;
}
