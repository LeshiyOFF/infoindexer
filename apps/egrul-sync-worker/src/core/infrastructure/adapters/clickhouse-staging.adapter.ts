/**
 * ClickHouse Staging Adapter
 *
 * @remarks
 * Implementation of IStagingStoragePort for ClickHouse.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles staging table operations.
 *
 * Uses tables from Migration 016:
 * - egrul_staging_companies
 * - egrul_staging_directorships
 * - egrul_staging_ownerships
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Single Responsibility Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IStagingStoragePort } from '../../domain/ports/i-staging-storage.port';
import type {
  StagingCompanyRow,
  StagingDirectorshipRow,
  StagingOwnershipRow
} from '../../domain/entities';
import { StagingStats } from '../../domain/dto/staging-stats.dto';
import type { EgrulCompanyRow } from '../../entities/egrul-company.interface';

/**
 * Result row from egrul_transform_state query
 *
 * @remarks
 * Strict typing for ClickHouse query results.
 */
interface TransformStateRow {
  readonly row_count: number;
  readonly last_transform_at: string;
  readonly status: string;
}

export class ClickHouseStagingAdapter implements IStagingStoragePort {
  constructor(private readonly client: ClickHouseClient) {}

  async insertCompanies(records: readonly StagingCompanyRow[]): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    await this.client.insert({
      table: 'egrul_staging_companies',
      values: records,
      format: 'JSONEachRow'
    });

    return records.length;
  }

  async insertDirectorships(records: readonly StagingDirectorshipRow[]): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    await this.client.insert({
      table: 'egrul_staging_directorships',
      values: records,
      format: 'JSONEachRow'
    });

    return records.length;
  }

  async insertOwnerships(records: readonly StagingOwnershipRow[]): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    await this.client.insert({
      table: 'egrul_staging_ownerships',
      values: records,
      format: 'JSONEachRow'
    });

    return records.length;
  }

  async truncateAll(): Promise<void> {
    const queries = [
      'TRUNCATE TABLE IF EXISTS egrul_staging_companies',
      'TRUNCATE TABLE IF EXISTS egrul_staging_directorships',
      'TRUNCATE TABLE IF EXISTS egrul_staging_ownerships'
    ];

    await Promise.all(
      queries.map(query => this.client.command({ query }))
    );
  }

  /**
   * Inserts companies for future transformation
   *
   * @remarks
   * Maps EgrulCompanyRow → StagingCompanyRow and inserts into staging.
   *
   * Mapping:
   * - Date → DateTime64(3, 'UTC') conversion
   * - Optional fields handling (first_seen, last_changed)
   */
  async insertCompaniesForTransform(records: readonly EgrulCompanyRow[]): Promise<number> {
    if (records.length === 0) return 0;

    const stagingRows: StagingCompanyRow[] = records.map(r => ({
      id: r.id,
      inn: r.inn,
      name: r.name,
      status: r.status,
      address: r.address,
      first_seen: r.first_seen ? new Date(r.first_seen) : undefined,
      last_changed: r.last_changed ? new Date(r.last_changed) : undefined
    }));

    return this.insertCompanies(stagingRows);
  }

  /**
   * Gets statistics for a staging table
   *
   * @remarks
   * Queries egrul_transform_state for transform status.
   */
  async getStats(tableName: string): Promise<StagingStats> {
    const result = await this.client.query({
      query: `
        SELECT
          count() as row_count,
          max(last_transform_at) as last_transform_at,
          status
        FROM egrul_transform_state
        WHERE table_name = {table_name: String}
      `,
      query_params: { table_name: tableName },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as TransformStateRow[];

    if (rows.length === 0 || rows[0].row_count === 0) {
      return new StagingStats(
        tableName,
        0,
        0,
        new Date('1970-01-01'),
        'idle'
      );
    }

    return StagingStats.fromRaw({
      table_name: tableName,
      last_staging_count: Number(rows[0].row_count),
      last_transform_at: rows[0].last_transform_at || '1970-01-01',
      status: rows[0].status || 'idle'
    });
  }

  /**
   * Truncates a specific staging table
   *
   * @remarks
   * Used by Transform Service for cleanup after successful transform.
   */
  async truncate(tableName: string): Promise<void> {
    await this.client.command({
      query: `TRUNCATE TABLE IF EXISTS ${tableName}`
    });
  }
}
