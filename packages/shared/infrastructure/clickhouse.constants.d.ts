/**
 * ClickHouse configuration constants
 *
 * @remarks
 * Single source of truth for default values (DRY principle).
 * Tuned for single-node deployment with 70M rows (~20GB data).
 *
 * Values based on:
 * - ClickHouse official documentation
 * - Best practices for OLTP workloads
 * - Single-node hardware constraints
 *
 * @see https://clickhouse.com/docs/en/operations/settings
 */
export declare const CLICKHOUSE_DEFAULTS: {
    /**
     * Maximum concurrent connections to ClickHouse
     *
     * @remarks
     * - Value 100 is conservative for single-node
     * - Each connection uses memory (~10MB default)
     * - Increase if you have more concurrent workers
     */
    readonly MAX_OPEN_CONNECTIONS: 100;
    /**
     * Maximum idle connections to keep open
     *
     * @remarks
     * - Reduces connection overhead
     * - 10 is sufficient for typical workload
     */
    readonly MAX_IDLE_CONNECTIONS: 10;
    /**
     * Close idle connections after timeout (milliseconds)
     *
     * @remarks
     * - 30 seconds prevents connection leaks
     * - ClickHouse default is too high for containerized environments
     */
    readonly CONNECTION_IDLE_TIMEOUT: 30000;
    /**
     * Enable async insert
     *
     * @remarks
     * - 0 = disabled (synchronous insert)
     * - 1 = enabled (3-5x faster inserts)
     *
     * Trade-off: Small delay before data is visible in queries.
     * Protected by: Checkpoint (Iteration 1) for crash recovery.
     */
    readonly ASYNC_INSERT: 1;
    /**
     * Wait for async insert to complete
     *
     * @remarks
     * - 0 = don't wait (return immediately)
     * - 1 = wait for insert to finish
     *
     * Set to 0 for maximum throughput.
     */
    readonly WAIT_FOR_ASYNC_INSERT: 0;
    /**
     * Maximum block size for async insert
     *
     * @remarks
     * - 1,048,576 rows = 1M rows per batch
     * - Balances memory usage vs. throughput
     * - ClickHouse default is too small for bulk inserts
     * - Type: string (UInt64 in ClickHouse)
     */
    readonly MAX_INSERT_BLOCK_SIZE: "1048576";
    /**
     * Maximum concurrent queries
     *
     * @remarks
     * - Prevents query overload
     * - 100 is reasonable for single-node
     * - Additional queries are queued
     * - Type: string (UInt64 in ClickHouse)
     */
    readonly MAX_CONCURRENT_QUERIES: "100";
    /**
     * Maximum query execution time (seconds)
     *
     * @remarks
     * - 60 seconds timeout for most queries
     * - Long-running queries should be optimized
     * - Prevents runaway queries
     * - Type: number (Seconds in ClickHouse)
     */
    readonly MAX_EXECUTION_TIME: 60;
    /**
     * Maximum memory usage per query (bytes)
     *
     * @remarks
     * - 10,000,000,000 bytes = 10GB
     * - Prevents OOM on single-node
     * - Adjust based on available RAM
     * - Type: string (UInt64 in ClickHouse)
     */
    readonly MAX_MEMORY_USAGE: "10000000000";
    /**
     * Maximum rows to read per query
     *
     * @remarks
     * - 10,000,000,000 rows = prevents runaway scans
     * - Protects against accidental full-table scans
     * - Type: string (UInt64 in ClickHouse)
     */
    readonly MAX_ROWS_TO_READ: "10000000000";
    /**
     * Maximum bytes to read per query
     *
     * @remarks
     * - 10,000,000,000 bytes = 10GB limit
     * - Prevents OOM from large result sets
     * - Type: string (UInt64 in ClickHouse)
     */
    readonly MAX_BYTES_TO_READ: "10000000000";
    /**
     * Optimize read queries for ORDER BY
     *
     * @remarks
     * - 0 = disabled
     * - 1 = enabled (faster ordered reads)
     *
     * Useful when queries often ORDER BY the same columns
     * as the table ORDER BY clause.
     */
    readonly OPTIMIZE_READ_IN_ORDER: 1;
    /**
     * Enable experimental parallel reading
     *
     * @remarks
     * - 0 = disabled
     * - 1 = enabled (parallel query execution)
     *
     * Allows single-node to use multiple threads for reading.
     * More efficient than parallel_replicas_count for single-node.
     */
    readonly ALLOW_EXPERIMENTAL_PARALLEL_READING: 1;
    /**
     * Maximum threads for query execution
     *
     * @remarks
     * - 4 threads for single-node deployment
     * - Balances CPU utilization vs. contention
     * - Adjust based on available cores
     * - Type: number
     */
    readonly MAX_THREADS: 4;
};
/**
 * Frozen type for ClickHouse defaults
 *
 * @remarks
 * Provides TypeScript autocomplete and type safety.
 * All values are readonly at compile time.
 */
export type ClickHouseDefaults = typeof CLICKHOUSE_DEFAULTS;
