/**
 * Batch Flusher Service for Staging + Transform Pattern
 *
 * @remarks
 * Following SRP: responsible only for batch flushing operations.
 * Following DIP: depends on IStagingStoragePort (abstraction).
 *
 * Staging Pattern: All data goes to staging for transform service.
 * Memory benefit: 5.6GB → ~200MB (28x reduction).
 *
 * v1.5: Uses staging instead of direct MV-triggered inserts.
 */
import type { EgrulCompanyRow, StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
/**
 * Состояние батчей для сброса в ClickHouse
 *
 * @remarks
 * Refactored for Staging + Transform approach.
 * All data goes to staging for transform service processing.
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
 * - All INSERT to egrul_staging_* tables (no MV triggers)
 * - Transform Service handles staging → production
 * - Prevents OOM by avoiding AggregatingMergeTree on each insert
 *
 * v1.5: Companies now use insertCompaniesForTransform instead of direct insert.
 */
export declare class BatchFlusher {
    private readonly stagingStorage;
    constructor(stagingStorage: IStagingStoragePort);
    /**
     * Сбрасывает батчи если они достигли размера
     *
     * @remarks
     * All inserts go to staging tables (no MV triggers).
     * Transform Service (Iteration 2) will process staging → production.
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
