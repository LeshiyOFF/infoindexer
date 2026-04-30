/**
 * ClickHouse Production Adapter
 *
 * @remarks
 * Implementation of IProductionStorage for ClickHouse.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles production table operations.
 *
 * Production tables from Migration 018:
 * - companies_production (aggregated companies)
 * - directors_production (aggregated directors)
 * - founders_production (aggregated founders)
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Single Responsibility Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IProductionStorage, ProductionCompanyRow, ProductionDirectorRow, ProductionFounderRow } from '../../domain/ports/i-production-storage.port';
import { ProductionStats } from '../../domain/dto/production-stats.dto';
export declare class ClickHouseProductionAdapter implements IProductionStorage {
    private readonly client;
    constructor(client: ClickHouseClient);
    insertCompanies(companies: readonly ProductionCompanyRow[]): Promise<number>;
    insertDirectors(directors: readonly ProductionDirectorRow[]): Promise<number>;
    insertFounders(founders: readonly ProductionFounderRow[]): Promise<number>;
    getStats(tableName: string): Promise<ProductionStats>;
}
