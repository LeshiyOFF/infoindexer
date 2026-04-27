import type { ClickHouseClient } from '@clickhouse/client';
import type { CompanyMeta } from '../../interfaces';
/**
 * Параметры для запроса связей
 */
export interface ConnectionQueryParams {
    director: string;
    founders: string[];
    inn: string;
}
/**
 * Сервис для поиска связанных организаций
 */
export declare class ConnectionsQueryService {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Находит организации, связанные через директора или учредителей
     */
    findByDirectorOrFounders(params: ConnectionQueryParams): Promise<Partial<CompanyMeta>[]>;
    /**
     * Строит SQL запрос для поиска связей
     */
    private buildQuery;
    /**
     * Строит параметры запроса
     */
    private buildParams;
    /**
     * Гарантирует, что результат является массивом
     */
    private ensureArray;
}
