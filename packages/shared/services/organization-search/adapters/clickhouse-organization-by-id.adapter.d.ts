import type { ClickHouseClient } from '@clickhouse/client';
import type { IOrganizationById, OrganizationByIdResult } from '../ports/i-organization-by-id.port';
import type { IConnections } from '../ports/i-connections.port';
/**
 * Adapter для получения организации по ID через ClickHouse
 *
 * @remarks
 * Реализует Port IOrganizationById для ClickHouse.
 */
export declare class ClickHouseOrganizationById implements IOrganizationById {
    private readonly client;
    private readonly connections;
    constructor(client: ClickHouseClient, connections: IConnections);
    /**
     * Получает организацию по ИНН/ОГРН
     */
    findById(id: string): Promise<OrganizationByIdResult>;
    /**
     * Получает финансовые отчёты организации
     */
    private fetchFinancialReports;
    /**
     * Получает метаданные организации
     */
    private fetchMetadata;
    /**
     * Получает санкции организации
     */
    private fetchSanctions;
    /**
     * Получает связанные организации
     */
    private fetchConnections;
}
