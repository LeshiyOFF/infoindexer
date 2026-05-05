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
 * Uses tables from Migration 016:
 * - egrul_staging_companies
 * - egrul_staging_directorships
 * - egrul_staging_ownerships
 *
 * @see ClickHouseStagingAdapter for implementation
 */
import type { StagingCompanyRow, StagingDirectorshipRow, StagingEntityRow, StagingOwnershipRow } from '../entities';
import type { StagingStats } from '../dto/staging-stats.dto';
import type { EgrulCompanyRow } from '../../entities/egrul-company.interface';

export interface IStagingStoragePort {
  /**
   * Inserts company records into staging table
   *
   * @param records - Array of staging company records
   * @returns Number of records inserted
   */
  insertCompanies(records: readonly StagingCompanyRow[]): Promise<number>;

  /**
   * Inserts unified entity records into staging table
   *
   * @remarks
   * Uses table egrul_staging_entities from Migration 022.
   * Supports all FTM base entity types (Company, Organization, LegalEntity, Person).
   *
   * @param records - Array of staging entity records
   * @returns Number of records inserted
   */
  insertEntities(records: readonly StagingEntityRow[]): Promise<number>;

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

  /**
   * Inserts companies for future transformation
   *
   * @remarks
   * Temporary method for Iteration 1.
   * Maps EgrulCompanyRow → StagingCompanyRow and inserts into staging.
   *
   * Mapping rules:
   * - id → id (FTM entity ID)
   * - inn → inn (company tax ID)
   * - name → name
   * - status → status
   * - address → address
   * - first_seen → first_seen (optional Date → DateTime64)
   * - last_changed → last_changed (optional Date → DateTime64)
   *
   * Used by BatchFlusher instead of direct insert to egrul_companies_raw.
   * Transform Service (Iteration 2) will process staging → production.
   *
   * @param records - Array of EgrulCompanyRow from parser
   * @returns Number of records inserted
   */
  insertCompaniesForTransform(records: readonly EgrulCompanyRow[]): Promise<number>;

  /**
   * Gets statistics for a staging table
   *
   * @remarks
   * Added for Transform Service polling mechanism.
   *
   * @param tableName - Name of the staging table
   * @returns Statistics including row count and transform status
   */
  getStats(tableName: string): Promise<StagingStats>;

  /**
   * Truncates a specific staging table
   *
   * @remarks
   * Added for Transform Service cleanup after successful transform.
   *
   * @param tableName - Name of the staging table to truncate
   */
  truncate(tableName: string): Promise<void>;
}
