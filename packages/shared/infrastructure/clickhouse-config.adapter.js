"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseConfigAdapter = void 0;
exports.createClickHouseConfig = createClickHouseConfig;
const clickhouse_constants_1 = require("./clickhouse.constants");
const file_certificate_provider_adapter_1 = require("./file-certificate-provider.adapter");
/**
 * ClickHouse configuration adapter (Hexagonal / Ports & Adapters)
 * Infrastructure Layer: Implements IClickHouseConfig port from Domain.
 */
class ClickHouseConfigAdapter {
    certProvider;
    // ============================================
    // CONNECTION SETTINGS
    // ============================================
    url;
    username;
    password;
    database;
    request_timeout;
    // ============================================
    // CONNECTION POOL SETTINGS
    // ============================================
    max_open_connections;
    max_idle_connections;
    connection_idle_timeout;
    // ============================================
    // CLICKHOUSE SESSION SETTINGS
    // ============================================
    clickhouse_settings;
    // ============================================
    // TLS SETTINGS (Iteration 9)
    // ============================================
    tls;
    // ============================================
    // CONSTRUCTOR
    // ============================================
    constructor(certProvider) {
        this.certProvider = certProvider;
        // Build URL from environment or default to localhost
        this.url = this.buildUrl();
        // Authentication settings
        this.username = this.getUsername();
        this.password = this.getPassword();
        // Database name (default to 'default' database)
        this.database = process.env.CLICKHOUSE_DB || 'default';
        // Request timeout (100 seconds for large queries)
        this.request_timeout = 100000;
        // Connection pool settings from constants (DRY)
        this.max_open_connections = clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_OPEN_CONNECTIONS;
        this.max_idle_connections = clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_IDLE_CONNECTIONS;
        this.connection_idle_timeout = clickhouse_constants_1.CLICKHOUSE_DEFAULTS.CONNECTION_IDLE_TIMEOUT;
        // ClickHouse session settings from constants (DRY)
        this.clickhouse_settings = this.buildSettings();
        // TLS settings from environment (optional) - Iteration 9.1
        this.tls = this.buildTLSSettings();
    }
    // ============================================
    // PRIVATE METHODS
    // ============================================
    /**
     * Build ClickHouse HTTP/HTTPS URL from environment
     * @throws {Error} If CLICKHOUSE_HOST is invalid (empty string)
     * @returns ClickHouse endpoint (http://host:8123 or https://host:8443)
     */
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
        if (!username || username.trim().length === 0) {
            return 'default';
        }
        return username.trim();
    }
    getPassword() {
        const password = process.env.CLICKHOUSE_PASSWORD;
        if (!password || password.trim().length === 0) {
            return undefined;
        }
        return password.trim();
    }
    /**
     * Build ClickHouse settings from constants
     * @returns ClickHouse session settings object
     */
    buildSettings() {
        return {
            async_insert: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.ASYNC_INSERT,
            wait_for_async_insert: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.WAIT_FOR_ASYNC_INSERT,
            max_insert_block_size: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_INSERT_BLOCK_SIZE,
            max_execution_time: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_EXECUTION_TIME,
            max_memory_usage: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_MEMORY_USAGE,
            max_rows_to_read: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_ROWS_TO_READ,
            max_bytes_to_read: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_BYTES_TO_READ,
            optimize_read_in_order: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.OPTIMIZE_READ_IN_ORDER,
            max_threads: clickhouse_constants_1.CLICKHOUSE_DEFAULTS.MAX_THREADS,
        };
    }
    /**
     * Build TLS settings from environment and certificate provider
     * @throws {Error} If CLICKHOUSE_SECURE=true but certificate not found
     * @returns TLS settings object or undefined (if disabled)
     */
    buildTLSSettings() {
        const secure = process.env.CLICKHOUSE_SECURE;
        if (secure !== 'true') {
            return undefined;
        }
        // Use injected provider or create default (FileSystem)
        const provider = this.certProvider || (0, file_certificate_provider_adapter_1.createCertificateProvider)();
        try {
            const caCert = provider.getCACert();
            return {
                ca_cert: caCert,
            };
        }
        catch (error) {
            throw new Error(`TLS enabled but certificate not found. Run: npm run setup:certs`);
        }
    }
}
exports.ClickHouseConfigAdapter = ClickHouseConfigAdapter;
/**
 * Factory function for creating ClickHouse configuration.
 * Returns IClickHouseConfig interface (not concrete class).
 */
function createClickHouseConfig() {
    return new ClickHouseConfigAdapter();
}
