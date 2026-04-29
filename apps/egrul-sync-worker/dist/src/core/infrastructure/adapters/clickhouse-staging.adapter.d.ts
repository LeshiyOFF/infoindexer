/**
 * ClickHouse Staging Adapter
 *
 * @remarks
 * Implementation of IStagingStoragePort for ClickHouse.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles staging table operations.
 *
 * Uses tables from Migration 016:
 * - egrul_staging_companies
 * - egrul_staging_directorships
 * - egrul_staging_ownerships
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Single Responsibility Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IStagingStoragePort } from '../../domain/ports/i-staging-storage.port';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../../domain/entities';
import { StagingStats } from '../../domain/dto/staging-stats.dto';
import type { EgrulCompanyRow } from '../../entities/egrul-company.interface';
export declare class ClickHouseStagingAdapter implements IStagingStoragePort {
    private readonly client;
    constructor(client: ClickHouseClient);
    insertCompanies(records: readonly StagingCompanyRow[]): Promise<number>;
    insertDirectorships(records: readonly StagingDirectorshipRow[]): Promise<number>;
    insertOwnerships(records: readonly StagingOwnershipRow[]): Promise<number>;
    truncateAll(): Promise<void>;
    /**
     * Inserts companies for future transformation
     *
     * @remarks
     * Maps EgrulCompanyRow → StagingCompanyRow and inserts into staging.
     *
     * Mapping:
     * - Date → DateTime64(3, 'UTC') conversion
     * - Optional fields handling (first_seen, last_changed)
     */
    insertCompaniesForTransform(records: readonly EgrulCompanyRow[]): Promise<number>;
    /**
     * Gets statistics for a staging table
     *
     * @remarks
     * Queries egrul_transform_state for transform status.
     */
    getStats(tableName: string): Promise<StagingStats>;
    /**
     * Truncates a specific staging table
     *
     * @remarks
     * Used by Transform Service for cleanup after successful transform.
     */
    truncate(tableName: string): Promise<void>;
}
