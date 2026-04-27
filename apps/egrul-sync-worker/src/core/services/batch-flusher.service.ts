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
 * Companies go directly to production.
 * Relationships go to staging for transformation.
 */
export interface BatchState {
  // Production: companies with INN (direct insert)
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
 * - INSERT to egrul_companies_raw → companies_mv auto-updates
 * - INSERT to egrul_staging_* tables → for later transformation
 * - INSERT to egrul_directors_denormalized → directors_mv auto-updates
 * - INSERT to egrul_founders_denormalized → founders_mv auto-updates
 */
export class BatchFlusher {
  constructor(
    private readonly repository: ClickHouseRepository,
    private readonly stagingStorage: IStagingStoragePort
  ) {}

  /**
   * Сбрасывает батчи если они достигли размера
   *
   * @remarks
   * Production inserts go directly to MV-backed tables.
   * Staging inserts go to staging tables for transformation.
   */
  async flushBatchesIfNeeded(state: BatchState, batchSize: number): Promise<void> {
    if (state.companies.length >= batchSize) {
      await this.repository.insertBatch('egrul_companies_raw', state.companies);
      state.companies = [];
    }

    if (state.stagingCompanies.length >= batchSize) {
      await this.stagingStorage.insertCompanies(state.stagingCompanies);
      state.stagingCompanies = [];
    }

    if (state.directorships.length >= batchSize) {
      await this.stagingStorage.insertDirectorships(state.directorships);
      state.directorships = [];
    }

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
      await this.repository.insertBatch('egrul_companies_raw', state.companies);
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
