/**
 * Transform State Manager
 *
 * @remarks
 * Manages egrul_transform_state table operations.
 * Follows SRP: only responsible for transform state.
 *
 * @pattern Single Responsibility Principle
 * @pattern Repository Pattern
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { TransformStatus } from '../domain/ports/i-transform-service.port';
import { queryJson } from '../infrastructure/clickhouse-query.helper';

/**
 * Database row from egrul_transform_state
 *
 * @remarks
 * Strict typing for ClickHouse query results.
 */
interface TransformStateDbRow {
  readonly table_name: string;
  readonly last_staging_count: string;
  readonly last_transform_at: string;
  readonly status: string;
  readonly error_message?: string;
}

/**
 * Transform state record (domain model)
 */
interface TransformStateRecord {
  readonly table_name: string;
  readonly last_staging_count: number;
  readonly last_transform_at: Date;
  readonly status: TransformStatus;
  readonly error_message?: string;
}

/**
 * Transform State Manager
 *
 * @remarks
 * Handles all operations on egrul_transform_state table.
 * Uses queryJson helper for type-safe queries.
 */
export class TransformStateManager {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Set transform status
   */
  async setStatus(tableName: string, status: TransformStatus): Promise<void> {
    await this.client.insert({
      table: 'egrul_transform_state',
      values: [{
        table_name: tableName,
        last_staging_count: 0,
        last_transform_at: new Date(),
        status,
        error_message: '',
        updated_at: new Date()
      }],
      format: 'JSONEachRow'
    });
  }

  /**
   * Set transform error status
   */
  async setError(tableName: string, error: string): Promise<void> {
    await this.client.insert({
      table: 'egrul_transform_state',
      values: [{
        table_name: tableName,
        last_staging_count: 0,
        last_transform_at: new Date(),
        status: 'error',
        error_message: error,
        updated_at: new Date()
      }],
      format: 'JSONEachRow'
    });
  }

  /**
   * Get all transform states
   *
   * @remarks
   * Uses queryJson helper for type-safe query execution.
   * Result is fully typed - no 'as' assertions in business logic.
   */
  async getAll(): Promise<TransformStateRecord[]> {
    const rows = await queryJson<TransformStateDbRow>(
      this.client,
      `
        SELECT
          table_name,
          last_staging_count,
          last_transform_at,
          status,
          error_message
        FROM egrul_transform_state
        ORDER BY table_name
      `
    );

    return rows.map(row => ({
      table_name: row.table_name,
      last_staging_count: Number(row.last_staging_count),
      last_transform_at: new Date(row.last_transform_at),
      status: row.status as TransformStatus,
      error_message: row.error_message
    }));
  }

  /**
   * Get state for specific table
   */
  async get(tableName: string): Promise<TransformStateRecord | null> {
    const all = await this.getAll();
    return all.find(r => r.table_name === tableName) || null;
  }
}
