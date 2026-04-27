import type { CompanyMeta } from '../../../interfaces';
/**
 * Параметры ClickHouse запроса
 */
export type QueryParams = Record<string, string | number | string[] | undefined>;
/**
 * Port для выполнения ClickHouse запросов
 *
 * @remarks
 * Интерфейс (Port) в терминологии Hexagonal Architecture.
 * Скрывает детали работы с ClickHouse.
 */
export interface IQueryExecutor {
    /**
     * Выполняет COUNT запрос
     *
     * @param whereClause - WHERE условие
     * @param queryParams - Параметры запроса
     * @returns Общее количество записей
     */
    executeCount(whereClause: string, queryParams: QueryParams): Promise<number>;
    /**
     * Выполняет SELECT запрос
     *
     * @param whereClause - WHERE условие
     * @param sortBy - Поле сортировки
     * @param sortOrder - Направление сортировки
     * @param queryParams - Параметры запроса
     * @param hasOkvedColumn - Наличие колонки okved
     * @returns Массив компаний
     */
    executeSelect(whereClause: string, sortBy: string, sortOrder: string, queryParams: QueryParams, hasOkvedColumn: boolean): Promise<CompanyMeta[]>;
}
