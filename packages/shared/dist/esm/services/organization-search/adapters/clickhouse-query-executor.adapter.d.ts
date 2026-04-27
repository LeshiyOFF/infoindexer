import type { ClickHouseClient } from '@clickhouse/client';
import type { CompanyMeta } from '../../../interfaces';
import type { QueryParams } from '../ports/i-query-executor.port';
import type { IQueryExecutor } from '../ports/i-query-executor.port';
/**
 * Adapter для выполнения запросов через ClickHouse
 *
 * @remarks
 * Реализует Port IQueryExecutor для ClickHouse.
 */
export declare class ClickHouseQueryExecutor implements IQueryExecutor {
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
}
