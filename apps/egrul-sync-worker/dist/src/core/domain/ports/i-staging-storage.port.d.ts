/**
 * Port: Staging Storage (OUTBOUND)
 *
 * @remarks
 * Defines contract for storing raw FTM entities in staging layer.
 * Follows Dependency Inversion: infrastructure depends on this port.
 * Follows Interface Segregation: focused, single-purpose interface.
 *
 * Staging layer stores raw FTM data before transformation to production format.
 *
 * @see ClickHouseStagingAdapter for implementation
 */
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../entities';
export interface IStagingStoragePort {
    /**
     * Inserts company records into staging table
     *
     * @param records - Array of staging company records
     * @returns Number of records inserted
     */
    insertCompanies(records: readonly StagingCompanyRow[]): Promise<number>;
    /**
     * Inserts directorship records into staging table
     *
     * @param records - Array of staging directorship records
     * @returns Number of records inserted
     */
    insertDirectorships(records: readonly StagingDirectorshipRow[]): Promise<number>;
    /**
     * Inserts ownership records into staging table
     *
     * @param records - Array of staging ownership records
     * @returns Number of records inserted
     */
    insertOwnerships(records: readonly StagingOwnershipRow[]): Promise<number>;
    /**
     * Truncates all staging tables
     *
     * @remarks
     * Used for clean slate before sync or for testing.
     */
    truncateAll(): Promise<void>;
}
