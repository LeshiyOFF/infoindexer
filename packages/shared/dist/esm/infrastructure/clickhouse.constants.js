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
export const CLICKHOUSE_DEFAULTS = {
    // ============================================
    // CONNECTION POOL SETTINGS
    // ============================================
    /** Maximum concurrent connections to ClickHouse. Value 100 is conservative for single-node. */
    MAX_OPEN_CONNECTIONS: 100,
    /** Maximum idle connections to keep open. Reduces connection overhead. */
    MAX_IDLE_CONNECTIONS: 10,
    /** Close idle connections after timeout (ms). 30s prevents connection leaks in containers. */
    CONNECTION_IDLE_TIMEOUT: 30000,
    // ============================================
    // ASYNC INSERT SETTINGS
    // ============================================
    /** Enable async insert (0=disabled, 1=enabled). 3-5x faster inserts. */
    ASYNC_INSERT: 1,
    /** Wait for async insert to complete (0=don't wait, 1=wait). Set to 0 for max throughput. */
    WAIT_FOR_ASYNC_INSERT: 0,
    /** Maximum block size for async insert (rows). 1M rows balances memory vs throughput. Type: string (UInt64). */
    MAX_INSERT_BLOCK_SIZE: '1048576',
    // ============================================
    // QUERY OPTIMIZATION SETTINGS
    // ============================================
    /** Maximum concurrent queries. Prevents query overload. Type: string (UInt64). */
    MAX_CONCURRENT_QUERIES: '100',
    /**
     * Maximum query execution time (seconds)
     *
     * @remarks
     * - 180s for batch processing with increased memory (8GB)
     * - Safety margin: HTTP_timeout (360s) / SQL_timeout (180s) = 2x
     * - Formula: 360000ms / 1000 / 2 = 180s
     */
    MAX_EXECUTION_TIME: 180,
    /**
     * Maximum memory usage per query (bytes)
     *
     * @remarks
     * - 8GB < Docker limit 10GB (80% utilization, 20% headroom)
     * - Formula: 10GB * 0.8 = 8GB
     * - Headroom: 2GB for ClickHouse process overhead
     * - See: docs/docker-setup.md for full calculations
     */
    MAX_MEMORY_USAGE: '8000000000',
    // ============================================
    // QUERY LIMITS
    // ============================================
    /** Maximum rows to read per query. Prevents runaway scans. Type: string (UInt64). */
    MAX_ROWS_TO_READ: '10000000000',
    /** Maximum bytes to read per query. Prevents OOM from large results. Type: string (UInt64). */
    MAX_BYTES_TO_READ: '10000000000',
    // ============================================
    // PERFORMANCE SETTINGS
    // ============================================
    /** Optimize read queries for ORDER BY (0=disabled, 1=enabled). Faster ordered reads. */
    OPTIMIZE_READ_IN_ORDER: 1,
    // ============================================
    // PARALLEL READING
    // ============================================
    /** Enable experimental parallel reading (0=disabled, 1=enabled). Single-node multi-thread. */
    ALLOW_EXPERIMENTAL_PARALLEL_READING: 1,
    /** Maximum threads for query execution. 4 threads balances CPU vs contention. */
    MAX_THREADS: 4,
};
