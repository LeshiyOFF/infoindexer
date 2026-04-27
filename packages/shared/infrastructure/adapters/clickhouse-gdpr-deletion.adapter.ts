/**
 * ClickHouse GDPR Deletion Adapter
 *
 * @remarks
 * Infrastructure Layer: ClickHouse implementation of IGdprDeletion.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port: IGdprDeletion
 * - Adapter: This class
 * - Implements Port contract using ClickHouse Client
 *
 * Design Decisions:
 * - Parallel deletion using Promise.all
 * - Partial success handling (continue if one table fails)
 * - query_params for SQL injection protection
 * - ONE source of truth for table names (from constants)
 *
 * Error Handling:
 * - Table-specific errors collected and returned
 * - At least one success = partial success
 * - All failures = total failure
 *
 * Iteration 13: GDPR Right-to-Delete
 */

import type { IGdprDeletion } from '../ports/i-gdpr-deletion.port';
import type { GdprDeleteRequest, GdprDeleteResult, TableError, DeletionCounts } from '../../domain/gdpr';
import type { ClickHouseClient } from '@clickhouse/client';
import { GdprDeleteResult as Result } from '../../domain/gdpr';
import { GDPR_TABLES, DEFAULT_DATABASE, getQualifiedTableName } from './clickhouse-gdpr-deletion.constants';
import { createDeletionCounts } from '../../domain/gdpr';

/**
 * ClickHouse GDPR Deletion Adapter
 *
 * @remarks
 * Implements GDPR deletion using ClickHouse ALTER TABLE DELETE.
 */
export class ClickHouseGdprDeletionAdapter implements IGdprDeletion {
  private readonly database: string;

  constructor(
    private readonly client: ClickHouseClient,
    config?: { database?: string }
  ) {
    this.database = config?.database || DEFAULT_DATABASE;
  }

  /**
   * Confirm deletion by counting records
   *
   * @param inn - Organization INN
   * @returns Deletion counts for all tables
   */
  async confirm(inn: string): Promise<GdprDeleteResult> {
    const counts = await this.countRecords(inn);
    return Result.confirmation(inn, counts);
  }

  /**
   * Execute deletion across all tables
   *
   * @param request - GDPR deletion request
   * @returns Deletion result with counts and errors
   */
  async execute(request: GdprDeleteRequest): Promise<GdprDeleteResult> {
    const results = await this.deleteFromAllTables(request.inn);

    const errors = results.filter((r): r is TableError => 'error' in r);
    const successes = results.filter((r): r is { table: string; count: number } => 'count' in r);

    // Build counts from successful deletions using factory
    const counts = createDeletionCounts(0, 0, 0, 0);

    // Need mutable copy for accumulation
    const mutableCounts = { ...counts };

    for (const success of successes) {
      const key = success.table as keyof DeletionCounts;
      if (key !== 'total') {
        mutableCounts[key] = success.count;
        mutableCounts.total += success.count;
      }
    }

    // Create readonly result
    const finalCounts: DeletionCounts = {
      financial_reports: mutableCounts.financial_reports,
      financial_reports_summary: mutableCounts.financial_reports_summary,
      companies_meta: mutableCounts.companies_meta,
      company_sanctions: mutableCounts.company_sanctions,
      total: mutableCounts.total
    };

    // Partial success if at least one table deleted
    const success = successes.length > 0;
    return success ? Result.success(request.inn, finalCounts) : Result.failure(request.inn, errors);
  }

  /**
   * Check if adapter is healthy
   *
   * @returns true if client is available
   */
  isHealthy(): boolean {
    return !!this.client;
  }

  /**
   * Count records across all tables
   *
   * @param inn - Organization INN
   * @returns Deletion counts
   */
  private async countRecords(inn: string): Promise<DeletionCounts> {
    const queries = GDPR_TABLES.map(table =>
      this.countInTable(inn, table)
    );

    const queryResults = await Promise.allSettled(queries);

    const countsArray = await Promise.all(
      queryResults.map(r => r.status === 'fulfilled' ? r.value : 0)
    );

    return createDeletionCounts(
      countsArray[0] || 0,
      countsArray[1] || 0,
      countsArray[2] || 0,
      countsArray[3] || 0
    );
  }

  /**
   * Count records in single table
   *
   * @param inn - Organization INN
   * @param table - Table name
   * @returns Record count
   */
  private async countInTable(inn: string, table: string): Promise<number> {
    try {
      const result = await this.client.query({
        query: `SELECT count() as cnt FROM ${getQualifiedTableName(this.database, table)} WHERE inn = {inn:String}`,
        query_params: { inn }
      });

      const json = await result.json() as unknown;
      if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object' && json[0] !== null) {
        const row = json[0] as { cnt?: string | number };
        const cnt = typeof row.cnt === 'string' ? parseInt(row.cnt, 10) : (typeof row.cnt === 'number' ? row.cnt : 0);
        return isNaN(cnt) ? 0 : cnt;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Delete from all tables in parallel
   *
   * @param inn - Organization INN
   * @returns Array of results (success or error)
   */
  private async deleteFromAllTables(inn: string): Promise<Array<{ table: string; count?: number; error?: string }>> {
    const deletions = GDPR_TABLES.map(table =>
      this.deleteFromTable(inn, table)
    );

    return Promise.all(deletions);
  }

  /**
   * Delete from single table
   *
   * @param inn - Organization INN
   * @param table - Table name
   * @returns Deletion result
   */
  private async deleteFromTable(inn: string, table: string): Promise<{ table: string; count: number } | TableError> {
    try {
      const beforeCount = await this.countInTable(inn, table);

      await this.client.command({
        query: `ALTER TABLE ${getQualifiedTableName(this.database, table)} DELETE WHERE inn = {inn:String}`,
        query_params: { inn }
      });

      return { table, count: beforeCount };
    } catch (error) {
      return {
        table,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

/**
 * Factory function
 *
 * @param client - ClickHouse client
 * @param config - Optional configuration
 * @returns IGdprDeletion instance
 */
export function createClickHouseGdprDeletion(
  client: ClickHouseClient,
  config?: { database?: string }
): IGdprDeletion {
  return new ClickHouseGdprDeletionAdapter(client, config);
}
