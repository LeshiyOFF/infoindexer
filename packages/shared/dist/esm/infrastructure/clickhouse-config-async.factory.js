import { CLICKHOUSE_DEFAULTS } from './clickhouse.constants';
import { createCertificateProvider } from './file-certificate-provider.adapter';
/**
 * Resource-aware ClickHouse configuration adapter
 */
class ResourceAwareClickHouseConfig {
    calculatedConfig;
    certProvider;
    url;
    username;
    password;
    database;
    request_timeout;
    max_open_connections;
    max_idle_connections;
    connection_idle_timeout;
    clickhouse_settings;
    tls;
    constructor(calculatedConfig, certProvider) {
        this.calculatedConfig = calculatedConfig;
        this.certProvider = certProvider;
        this.url = this.buildUrl();
        this.username = this.getUsername();
        this.password = this.getPassword();
        this.database = process.env.CLICKHOUSE_DB || 'default';
        this.request_timeout = this.calculateRequestTimeout();
        this.max_open_connections = CLICKHOUSE_DEFAULTS.MAX_OPEN_CONNECTIONS;
        this.max_idle_connections = CLICKHOUSE_DEFAULTS.MAX_IDLE_CONNECTIONS;
        this.connection_idle_timeout = CLICKHOUSE_DEFAULTS.CONNECTION_IDLE_TIMEOUT;
        this.clickhouse_settings = this.buildSettings();
        this.tls = this.buildTLSSettings();
    }
    buildUrl() {
        const host = process.env.CLICKHOUSE_HOST;
        const secure = process.env.CLICKHOUSE_SECURE === 'true';
        const scheme = secure ? 'https' : 'http';
        const port = secure ? '8443' : '8123';
        if (host) {
            const trimmed = host.trim();
            if (trimmed.length === 0) {
                throw new Error('CLICKHOUSE_HOST cannot be empty string');
            }
            return `${scheme}://${trimmed}:${port}`;
        }
        return `${scheme}://localhost:${port}`;
    }
    getUsername() {
        const username = process.env.CLICKHOUSE_USER;
        return username?.trim() || 'default';
    }
    getPassword() {
        const password = process.env.CLICKHOUSE_PASSWORD;
        return password?.trim() || undefined;
    }
    /**
     * Calculate request timeout based on max_execution_time
     *
     * Formula: HTTP_timeout > SQL_execution_time * safety_margin (3x)
     */
    calculateRequestTimeout() {
        const maxExecutionTime = this.calculatedConfig?.maxExecutionTime ?? CLICKHOUSE_DEFAULTS.MAX_EXECUTION_TIME;
        return maxExecutionTime * 3 * 1000;
    }
    /**
     * Build ClickHouse settings from calculated config or constants
     */
    buildSettings() {
        const config = this.calculatedConfig;
        return {
            async_insert: CLICKHOUSE_DEFAULTS.ASYNC_INSERT,
            wait_for_async_insert: CLICKHOUSE_DEFAULTS.WAIT_FOR_ASYNC_INSERT,
            max_insert_block_size: CLICKHOUSE_DEFAULTS.MAX_INSERT_BLOCK_SIZE,
            max_execution_time: config?.maxExecutionTime ?? CLICKHOUSE_DEFAULTS.MAX_EXECUTION_TIME,
            max_memory_usage: config?.maxMemoryUsage ?? CLICKHOUSE_DEFAULTS.MAX_MEMORY_USAGE,
            max_rows_to_read: CLICKHOUSE_DEFAULTS.MAX_ROWS_TO_READ,
            max_bytes_to_read: CLICKHOUSE_DEFAULTS.MAX_BYTES_TO_READ,
            optimize_read_in_order: CLICKHOUSE_DEFAULTS.OPTIMIZE_READ_IN_ORDER,
            max_threads: config?.maxThreads ?? CLICKHOUSE_DEFAULTS.MAX_THREADS,
        };
    }
    buildTLSSettings() {
        if (process.env.CLICKHOUSE_SECURE !== 'true') {
            return undefined;
        }
        const provider = this.certProvider || createCertificateProvider();
        try {
            const caCert = provider.getCACert();
            return { ca_cert: caCert };
        }
        catch (error) {
            throw new Error('TLS enabled but certificate not found. Run: npm run setup:certs');
        }
    }
}
/**
 * Create ClickHouse configuration with resource-aware settings
 *
 * @param calculatedConfig - Calculated config from ResourceAwareConfigService (optional)
 * @param certProvider - Certificate provider for TLS (optional)
 * @returns ClickHouse configuration
 *
 * @example
 * ```ts
 * const configService = createResourceAwareConfigService();
 * const result = await configService.initialize();
 * const config = await createClickHouseConfigAsync(result.config);
 * ```
 */
export async function createClickHouseConfigAsync(calculatedConfig = null, certProvider) {
    return new ResourceAwareClickHouseConfig(calculatedConfig, certProvider);
}
