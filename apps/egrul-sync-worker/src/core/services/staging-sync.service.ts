/**
 * Staging Sync Service
 *
 * @remarks
 * Orchestrates EGRUL sync with staging layer.
 * Follows SRP: coordinates sync flow.
 * Follows DIP: depends on ports, not concrete adapters.
 *
 * Flow: Parse → Staging → Transform Service (background) → Production
 *
 * v2.0: Removed IMVInsertPort dependency (staging+transform pattern).
 */
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import { StagingTransformResult } from '../domain/value-objects/staging-transform-result.vo';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import type { ITransformService } from '../domain/ports/i-transform-service.port';

/**
 * Staging Sync Service
 *
 * @remarks
 * Coordinates EGRUL data flow through staging to production.
 * Transform Service handles aggregation in background.
 */
export class StagingSyncService {
  constructor(
    private readonly stagingStorage: IStagingStoragePort,
    private readonly transformService: ITransformService
  ) {}

  /**
   * Processes a batch of EGRUL entities through staging
   *
   * @param companies - Company entities to store
   * @param directorships - Directorship relationships
   * @param ownerships - Ownership relationships
   * @returns Processing result with metrics
   *
   * @remarks
   * All data goes to staging tables.
   * Transform Service (polling worker) handles staging → production.
   */
  async processBatch(
    companies: readonly StagingCompanyRow[],
    directorships: readonly StagingDirectorshipRow[],
    ownerships: readonly StagingOwnershipRow[]
  ): Promise<StagingTransformResult> {
    if (companies.length === 0 && directorships.length === 0 && ownerships.length === 0) {
      return StagingTransformResult.success(0, 0, 0);
    }

    await Promise.all([
      this.insertCompanies(companies),
      this.insertStagingRelationships(directorships, ownerships)
    ]);

    // Trigger transform if threshold reached
    const transformResults = await this.transformService.transformIfNeeded();

    const totalProcessed = companies.length + directorships.length + ownerships.length;
    const directorsTransformed = transformResults
      .filter(r => r.tableName === 'egrul_staging_directorships')
      .reduce((sum, r) => sum + r.rowsProcessed, 0);
    const foundersTransformed = transformResults
      .filter(r => r.tableName === 'egrul_staging_ownerships')
      .reduce((sum, r) => sum + r.rowsProcessed, 0);

    return StagingTransformResult.success(
      directorsTransformed,
      foundersTransformed,
      0
    );
  }

  /**
   * Clears all staging tables
   *
   * @remarks
   * Used for clean slate before sync or for testing.
   */
  async clearStaging(): Promise<void> {
    await this.stagingStorage.truncateAll();
  }

  /**
   * Insert companies to staging
   *
   * @param records - Company records
   */
  private async insertCompanies(records: readonly StagingCompanyRow[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    await this.stagingStorage.insertCompanies(records);
  }

  /**
   * Insert relationships to staging
   *
   * @param directorships - Directorship records
   * @param ownerships - Ownership records
   */
  private async insertStagingRelationships(
    directorships: readonly StagingDirectorshipRow[],
    ownerships: readonly StagingOwnershipRow[]
  ): Promise<void> {
    await Promise.all([
      this.stagingStorage.insertDirectorships(directorships),
      this.stagingStorage.insertOwnerships(ownerships)
    ]);
  }
}
