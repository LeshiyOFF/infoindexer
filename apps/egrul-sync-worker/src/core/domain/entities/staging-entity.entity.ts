/**
 * Staging Entity Row (Unified)
 *
 * @remarks
 * Unified staging table for all FTM entities introduced in migration 022.
 * Replaces separate staging tables (StagingCompanyRow, StagingDirectorshipRow,
 * StagingOwnershipRow) which were limited by entity type or INN requirement.
 *
 * Key changes from legacy tables:
 * - Added 'schema' field for entity type discrimination (Person, Company, etc.)
 * - All entity fields (inn, name, status, address) are Nullable in ClickHouse
 *   to support entities without INN or incomplete data
 * - Relationships stored as-is (FTM IDs), transformation happens later
 *
 * Migration 022 path: packages/shared/infrastructure/migrations/files/egrul-sync-worker/022_create_staging_entities_and_production_v2.sql
 *
 * @see StagingTransformService for transformation logic
 */

/**
 * FTM entity schema discriminator
 *
 * @remarks
 * Represents the top-level 'schema' field from FTM entity structure.
 * Used to discriminate entity types in the unified staging table.
 *
 * Note: Only base entity types (not relationships).
 * Directorship/Ownership are stored in separate staging tables.
 */
export type FtmSchema =
  | 'Company'
  | 'Organization'
  | 'LegalEntity'
  | 'Person';

/**
 * Database row for egrul_staging_entities table
 *
 * @remarks
 * Corresponds 1:1 to ClickHouse table schema from migration 022.
 * Nullable columns in ClickHouse (Nullable(String)) are represented
 * as optional fields (?: string) in TypeScript.
 *
 * DateTime64 columns accept "YYYY-MM-DD HH:mm:ss.SSS" string format
 * when inserted via JSONEachRow. The ReplacingMergeTree engine uses
 * last_changed as the version column for deduplication.
 */
export interface StagingEntityRow {
  /** FTM entity ID (unique identifier) */
  readonly id: string;

  /** FTM entity schema discriminator */
  readonly schema: FtmSchema;

  /** Tax ID (nullable - Person/Organization may not have INN) */
  readonly inn?: string;

  /** Entity name (nullable - relationship entities don't have name) */
  readonly name?: string;

  /** Registration status (nullable - only relevant for base entities) */
  readonly status?: string;

  /** Legal address (nullable - only for base entities) */
  readonly address?: string;

  /** First appearance in source. Format: YYYY-MM-DD HH:mm:ss.SSS */
  readonly first_seen: string;

  /** Last modification date (ReplacingMergeTree version column). Format: YYYY-MM-DD HH:mm:ss.SSS */
  readonly last_changed: string;
}
