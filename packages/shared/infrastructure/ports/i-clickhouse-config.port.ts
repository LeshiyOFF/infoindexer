/**
 * Port for ClickHouse client configuration
 *
 * @remarks
 * Domain Layer: Defines the configuration contract.
 * Infrastructure Layer provides implementation via Adapter.
 *
 * Following DIP: High-level modules depend on this abstraction,
 * not on concrete implementation (process.env, files, etc.).
 *
 * @example
 * ```ts
 * const config: IClickHouseConfig = {
 *   url: 'http://localhost:8123',
 *   username: 'default',
 *   database: 'infoindexer',
 *   request_timeout: 100000,
 *   max_open_connections: 100,
 *   clickhouse_settings: {
 *     async_insert: 1,
 *     wait_for_async_insert: 0
 *   }
 * };
 * ```
 */
export interface IClickHouseConfig {
  /** ClickHouse HTTP endpoint */
  readonly url: string;

  /** Authentication username */
  readonly username: string;

  /** Authentication password (optional for default user) */
  readonly password?: string;

  /** Database name */
  readonly database: string;

  /** Request timeout in milliseconds */
  readonly request_timeout: number;

  /** Maximum open connections in pool */
  readonly max_open_connections: number;

  /** Maximum idle connections to keep open */
  readonly max_idle_connections: number;

  /** Idle connection timeout in milliseconds */
  readonly connection_idle_timeout: number;

  /** ClickHouse session settings for async insert and query optimization */
  readonly clickhouse_settings: ClickHouseSettings;
}

/**
 * ClickHouse session settings
 *
 * @remarks
 * Controls async insert behavior, query limits, and parallel execution.
 * Tuned for single-node deployment with 70M rows.
 *
 * Type compatibility with @clickhouse/client:
 * - Bool settings: 0 | 1 (literal types for strict typing)
 * - UInt64 settings: string (ClickHouse uses string for large numbers)
 * - Seconds settings: number
 * - Threads settings: number
 *
 * Index signature ensures compatibility with @clickhouse/client's
 * Record<string, string | number | boolean | SettingsMap | undefined>.
 *
 * @see https://clickhouse.com/docs/en/operations/settings
 */
export interface ClickHouseSettings {
  /** Enable async insert (0 = disabled, 1 = enabled) */
  readonly async_insert: 0 | 1;

  /** Wait for async insert to complete (0 = don't wait, return immediately) */
  readonly wait_for_async_insert: 0 | 1;

  /** Maximum block size for async insert (rows per batch) - UInt64 type */
  readonly max_insert_block_size: string;

  /** Maximum query execution time in seconds */
  readonly max_execution_time: number;

  /** Maximum memory usage per query in bytes - UInt64 type */
  readonly max_memory_usage: string;

  /** Maximum rows to read per query - UInt64 type */
  readonly max_rows_to_read: string;

  /** Maximum bytes to read per query - UInt64 type */
  readonly max_bytes_to_read: string;

  /** Optimize read queries for ORDER BY (0 = disabled, 1 = enabled) */
  readonly optimize_read_in_order: 0 | 1;

  /** Maximum threads for query execution */
  readonly max_threads: number;

  /** Index signature for @clickhouse/client compatibility */
  readonly [key: string]: string | number | boolean | undefined;
}
