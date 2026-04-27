import type { ClickHouseClient } from '@clickhouse/client';
import type { CompanyMeta } from '../../interfaces';
import type { QueryParams } from './search-params.builder';
/**
 * Сервис для выполнения ClickHouse запросов при поиске организаций
 */
export declare class QueryExecutorService {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Выполняет COUNT запрос
     */
    executeCount(whereClause: string, queryParams: QueryParams): Promise<number>;
    /**
     * Выполняет основной SELECT запрос
     */
    executeSelect(whereClause: string, sortBy: string, sortOrder: string, queryParams: QueryParams, hasOkvedColumn: boolean): Promise<CompanyMeta[]>;
    /**
     * Гарантирует, что результат является массивом
     */
    private ensureArray;
}
