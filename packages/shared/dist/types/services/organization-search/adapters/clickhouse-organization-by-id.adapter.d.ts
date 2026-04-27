import type { ClickHouseClient } from '@clickhouse/client';
import type { IOrganizationById, OrganizationByIdResult } from '../ports/i-organization-by-id.port';
import type { IConnections } from '../ports/i-connections.port';
/**
 * Adapter для получения организации по ID через ClickHouse
 */
export declare class ClickHouseOrganizationById implements IOrganizationById {
    private readonly client;
    private readonly connections;
    constructor(client: ClickHouseClient, connections: IConnections);
    findById(id: string): Promise<OrganizationByIdResult>;
    private fetchSummary;
    private mapRowToFinancialSummary;
    private fetchFinancialReports;
    private fetchMetadata;
    private fetchSanctions;
    private fetchConnections;
}
