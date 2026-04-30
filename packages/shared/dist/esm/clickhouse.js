"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clickhouseClient = void 0;
exports.createClickHouseClient = createClickHouseClient;
const client_1 = require("@clickhouse/client");
const clickhouse_config_adapter_1 = require("./infrastructure/clickhouse-config.adapter");
/**
 * ClickHouse client with async insert, connection pool tuning, and TLS support
 *
 * @remarks
 * Iteration 7 v3.0: Added async insert (3-5x faster) and connection pool.
 * Iteration 8 v3.0: Added query optimization (limits, parallel reading).
 * Iteration 9 v3.0: Added TLS/SSL support for secure connections.
 * Iteration 10 v3.0: Added factory function for custom configs.
 *
 * **Async Insert Behavior:**
 * - Data is buffered and inserted asynchronously
 * - Client returns immediately without waiting
 * - 3-5x faster insert throughput
 * - Protected by Checkpoint (Iteration 1) against crashes
 *
 * **Connection Pool:**
 * - Max 100 concurrent connections
 * - 10 idle connections kept open
 * - 30 second idle timeout
 *
 * **Query Limits:**
 * - 60 second execution timeout
 * - 10GB memory limit per query
 * - 100 concurrent queries maximum
 * - 10B rows/bytes read limits
 * - Parallel reading enabled (4 threads)
 *
 * **TLS/SSL Support:**
 * - Set CLICKHOUSE_SECURE=true to enable HTTPS
 * - Certificates required in docker/certs/
 * - Auto-detects HTTP vs HTTPS (8123 vs 8443)
 *
 * Architecture:
 * - Uses DIP: depends on IClickHouseConfig abstraction
 * - Configuration via Adapter (Hexagonal pattern)
 * - Constants defined centrally (DRY)
 *
 * @see https://clickhouse.com/docs/en/interfaces/http/
 */
/**
 * Default ClickHouse client singleton
 *
 * @remarks
 * Uses environment-based configuration.
 * For custom config, use createClickHouseClient() factory.
 */
exports.clickhouseClient = (0, client_1.createClient)((0, clickhouse_config_adapter_1.createClickHouseConfig)());
/**
 * Create ClickHouse client with custom configuration
 *
 * @param config - ClickHouse configuration (use createClickHouseConfig() or custom)
 * @returns Configured ClickHouse client instance
 *
 * @remarks
 * Factory function for creating clients with custom config.
 * Useful for testing or multi-database scenarios.
 *
 * @example
 * ```ts
 * const config = createClickHouseConfig();
 * const client = createClickHouseClient(config);
 * await client.query({ query: 'SELECT 1', format: 'JSONEachRow' });
 * await client.close();
 * ```
 */
function createClickHouseClient(config) {
    return (0, client_1.createClient)(config ?? (0, clickhouse_config_adapter_1.createClickHouseConfig)());
}
