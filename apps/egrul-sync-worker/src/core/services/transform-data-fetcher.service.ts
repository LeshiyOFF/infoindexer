/**
 * Transform Data Fetcher
 *
 * @remarks
 * Fetches and groups staging data for transformation.
 * Follows SRP: only responsible for data retrieval.
 *
 * @pattern Single Responsibility Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import { queryJson } from '../infrastructure/clickhouse-query.helper';

/**
 * Database row from egrul_staging_companies
 */
export interface StagingCompanyDbRow {
  readonly id: string;
  readonly inn: string;
  readonly name: string;
  readonly status: string;
  readonly address: string;
  readonly first_seen?: string;
  readonly last_changed?: string;
}

/**
 * Database row from egrul_staging_directorships
 */
export interface StagingDirectorshipDbRow {
  readonly id: string;
  readonly organization_id: string;
  readonly director_id: string;
  readonly role: string;
  readonly start_date: string;
  readonly end_date?: string;
}

/**
 * Database row from egrul_staging_ownerships
 */
export interface StagingOwnershipDbRow {
  readonly id: string;
  readonly owner_id: string;
  readonly asset_id: string;
  readonly percentage: string;
  readonly shares_count: string;
  readonly start_date: string;
  readonly end_date?: string;
}

/**
 * Union type for all staging table rows
 */
export type StagingDbRow = StagingCompanyDbRow | StagingDirectorshipDbRow | StagingOwnershipDbRow;

/**
 * Fetch result with grouped data
 */
export interface StagingDataResult {
  readonly data: Map<string, StagingDbRow[]>;
  readonly totalRows: number;
}

/**
 * Transform Data Fetcher
 *
 * @remarks
 * Reads staging tables and groups by primary key.
 * Uses queryJson helper for type-safe queries.
 */
export class TransformDataFetcher {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Fetch and group staging data
   *
   * @remarks
   * Uses queryJson helper for type-safe query execution.
   * Result is fully typed - no 'as' assertions in business logic.
   */
  async fetch(tableName: string): Promise<StagingDataResult> {
    const rows = await queryJson<StagingDbRow>(
      this.client,
      `SELECT * FROM ${tableName} SETTINGS max_threads = 1`
    );

    const grouped = this.groupByPrimaryKey(tableName, rows);

    return {
      data: grouped,
      totalRows: rows.length
    };
  }

  /**
   * Group rows by primary key
   */
  private groupByPrimaryKey(
    tableName: string,
    rows: StagingDbRow[]
  ): Map<string, StagingDbRow[]> {
    const grouped = new Map<string, StagingDbRow[]>();

    for (const row of rows) {
      const key = this.extractKey(tableName, row);
      if (!key) continue;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(row);
    }

    return grouped;
  }

  /**
   * Extract primary key from row based on table
   */
  private extractKey(tableName: string, row: StagingDbRow): string | null {
    if (this.isCompanyRow(row)) {
      return row.inn;
    }
    if (this.isDirectorshipRow(row)) {
      return row.organization_id;
    }
    if (this.isOwnershipRow(row)) {
      return row.asset_id;
    }
    return null;
  }

  /** Type guard for StagingCompanyDbRow */
  private isCompanyRow(row: StagingDbRow): row is StagingCompanyDbRow {
    return 'inn' in row;
  }

  /** Type guard for StagingDirectorshipDbRow */
  private isDirectorshipRow(row: StagingDbRow): row is StagingDirectorshipDbRow {
    return 'organization_id' in row;
  }

  /** Type guard for StagingOwnershipDbRow */
  private isOwnershipRow(row: StagingDbRow): row is StagingOwnershipDbRow {
    return 'asset_id' in row;
  }
}
