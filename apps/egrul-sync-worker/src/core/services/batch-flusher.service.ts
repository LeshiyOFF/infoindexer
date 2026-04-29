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
import type {
  EgrulCompanyRow,
  StagingCompanyRow,
  StagingDirectorshipRow,
  StagingOwnershipRow
} from '../domain/entities';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';

/**
 * Состояние батчей для сброса в ClickHouse
 *
 * @remarks
 * Refactored for Staging + Transform approach.
 * All data goes to staging for transform service processing.
 */
export interface BatchState {
  // Raw data from parser
  companies: EgrulCompanyRow[];

  // Staging: raw FTM entities (requires transformation)
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
export function createEmptyBatchState(): BatchState {
  return {
    companies: [],
    stagingCompanies: [],
    directorships: [],
    ownerships: []
  };
}

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
export class BatchFlusher {
  constructor(private readonly stagingStorage: IStagingStoragePort) {}

  /**
   * Сбрасывает батчи если они достигли размера
   *
   * @remarks
   * All inserts go to staging tables (no MV triggers).
   * Transform Service (Iteration 2) will process staging → production.
   */
  async flushBatchesIfNeeded(state: BatchState, batchSize: number): Promise<void> {
    // Companies → staging (via mapping from EgrulCompanyRow to StagingCompanyRow)
    if (state.companies.length >= batchSize) {
      await this.stagingStorage.insertCompaniesForTransform(state.companies);
      state.companies = [];
    }

    // Staging companies → staging (already in correct format)
    if (state.stagingCompanies.length >= batchSize) {
      await this.stagingStorage.insertCompanies(state.stagingCompanies);
      state.stagingCompanies = [];
    }

    // Directorships → staging
    if (state.directorships.length >= batchSize) {
      await this.stagingStorage.insertDirectorships(state.directorships);
      state.directorships = [];
    }

    // Ownerships → staging
    if (state.ownerships.length >= batchSize) {
      await this.stagingStorage.insertOwnerships(state.ownerships);
      state.ownerships = [];
    }
  }

  /**
   * Сбрасывает все оставшиеся батчи
   *
   * @remarks
   * Final flush after processing all records.
   */
  async flushAllBatches(state: BatchState): Promise<void> {
    if (state.companies.length > 0) {
      await this.stagingStorage.insertCompaniesForTransform(state.companies);
    }

    if (state.stagingCompanies.length > 0) {
      await this.stagingStorage.insertCompanies(state.stagingCompanies);
    }

    if (state.directorships.length > 0) {
      await this.stagingStorage.insertDirectorships(state.directorships);
    }

    if (state.ownerships.length > 0) {
      await this.stagingStorage.insertOwnerships(state.ownerships);
    }
  }
}
