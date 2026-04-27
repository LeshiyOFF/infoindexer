/**
 * Staging Sync Service
 *
 * @remarks
 * Orchestrates EGRUL sync with staging layer.
 * Follows SRP: coordinates sync flow.
 * Follows DIP: depends on ports, not concrete adapters.
 *
 * Flow: Parse → Staging → Transform → Production → MV
 *
 * Each batch:
 * 1. Store raw FTM entities in staging tables
 * 2. Transform to production format (ID resolution)
 * 3. Insert to production tables (MV auto-updates)
 */
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { StagingTransformService } from './staging-transform.service';
import type { IMVInsertPort } from '../ports/i-mv-insert.port';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import { StagingTransformResult } from '../domain/value-objects/staging-transform-result.vo';

export class StagingSyncService {
  constructor(
    private readonly stagingStorage: IStagingStoragePort,
    private readonly transformService: StagingTransformService,
    private readonly mvInsert: IMVInsertPort
  ) {}

  /**
   * Processes a batch of EGRUL entities through staging → transform → production
   *
   * @param companies - Company entities to store
   * @param directorships - Directorship relationships to transform
   * @param ownerships - Ownership relationships to transform
   * @returns Transformation result with metrics
   *
   * @remarks
   * Companies go directly to production (no transformation needed).
   * Directorships and ownerships are transformed via identity_mapping.
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

    const result = await this.transformService.transformAll(directorships, ownerships);

    if (result.totalProcessed > 0) {
      const [directors, founders] = await Promise.all([
        this.transformService.transformDirectorships(directorships),
        this.transformService.transformOwnerships(ownerships)
      ]);

      if (directors.length > 0 || founders.length > 0) {
        await this.mvInsert.insertAll(directors, founders);
      }
    }

    return result;
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

  private async insertCompanies(records: readonly StagingCompanyRow[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    await this.stagingStorage.insertCompanies(records);
  }

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
