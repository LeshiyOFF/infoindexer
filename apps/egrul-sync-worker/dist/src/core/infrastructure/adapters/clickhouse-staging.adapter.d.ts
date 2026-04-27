/**
 * ClickHouse Staging Adapter
 *
 * @remarks
 * Implements IStagingStoragePort for ClickHouse.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles staging table operations.
 *
 * Uses JSONEachRow format for efficient bulk inserts.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IStagingStoragePort } from '../../domain/ports/i-staging-storage.port';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../../domain/entities';
export declare class ClickHouseStagingAdapter implements IStagingStoragePort {
    private readonly client;
    constructor(client: ClickHouseClient);
    insertCompanies(records: readonly StagingCompanyRow[]): Promise<number>;
    insertDirectorships(records: readonly StagingDirectorshipRow[]): Promise<number>;
    insertOwnerships(records: readonly StagingOwnershipRow[]): Promise<number>;
    truncateAll(): Promise<void>;
}
