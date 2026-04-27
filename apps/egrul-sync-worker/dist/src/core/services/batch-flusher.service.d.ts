/**
 * Batch Flusher Service for Staging + Transform Pattern
 *
 * @remarks
 * Following SRP: responsible only for batch flushing operations.
 * Following DIP: depends on IStagingStoragePort (abstraction).
 *
 * MV Pattern: Each INSERT triggers auto-aggregation in respective MV.
 * Staging Pattern: Raw data goes to staging, transform service handles conversion.
 *
 * Memory benefit: 5.6GB → ~200MB (28x reduction).
 */
import type { ClickHouseRepository } from '../repositories/clickhouse.repository';
import type { EgrulCompanyRow, StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
/**
 * Состояние батчей для сброса в ClickHouse
 *
 * @remarks
 * Refactored for Staging + Transform approach.
 * Companies go directly to production.
 * Relationships go to staging for transformation.
 */
export interface BatchState {
    companies: EgrulCompanyRow[];
    stagingCompanies: StagingCompanyRow[];
    directorships: StagingDirectorshipRow[];
    ownerships: StagingOwnershipRow[];
}
/**
 * Factory for creating empty BatchState
 *
 * @remarks
 * DRY compliance: single source of truth for initial state.
 */
export declare function createEmptyBatchState(): BatchState;
/**
 * Сервис для батч-сброса данных в ClickHouse
 *
 * @remarks
 * Following Staging + Transform Pattern:
 * - INSERT to egrul_companies_raw → companies_mv auto-updates
 * - INSERT to egrul_staging_* tables → for later transformation
 * - INSERT to egrul_directors_denormalized → directors_mv auto-updates
 * - INSERT to egrul_founders_denormalized → founders_mv auto-updates
 */
export declare class BatchFlusher {
    private readonly repository;
    private readonly stagingStorage;
    constructor(repository: ClickHouseRepository, stagingStorage: IStagingStoragePort);
    /**
     * Сбрасывает батчи если они достигли размера
     *
     * @remarks
     * Production inserts go directly to MV-backed tables.
     * Staging inserts go to staging tables for transformation.
     */
    flushBatchesIfNeeded(state: BatchState, batchSize: number): Promise<void>;
    /**
     * Сбрасывает все оставшиеся батчи
     *
     * @remarks
     * Final flush after processing all records.
     */
    flushAllBatches(state: BatchState): Promise<void>;
}
