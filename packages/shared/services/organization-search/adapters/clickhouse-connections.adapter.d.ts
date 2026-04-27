import type { ClickHouseClient } from '@clickhouse/client';
import type { CompanyMeta } from '../../../interfaces';
import type { ConnectionQueryParams } from '../ports/i-connections.port';
import type { IConnections } from '../ports/i-connections.port';
/**
 * Adapter для поиска связанных организаций через ClickHouse
 *
 * @remarks
 * Реализует Port IConnections для ClickHouse.
 */
export declare class ClickHouseConnections implements IConnections {
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
}
