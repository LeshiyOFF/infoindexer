import type {
  IClickHouseConfig,
  ClickHouseSettings,
  TLSSettings
} from './ports/i-clickhouse-config.port';
import type { ICertificateProvider } from './ports/i-certificate-provider.port';
import { CLICKHOUSE_DEFAULTS } from './clickhouse.constants';
import { createCertificateProvider } from './file-certificate-provider.adapter';

/**
 * ClickHouse configuration adapter (Hexagonal / Ports & Adapters)
 * Infrastructure Layer: Implements IClickHouseConfig port from Domain.
 */
export class ClickHouseConfigAdapter implements IClickHouseConfig {
  // ============================================
  // CONNECTION SETTINGS
  // ============================================

  readonly url: string;
  readonly username: string;
  readonly password: string | undefined;
  readonly database: string;
  readonly request_timeout: number;

  // ============================================
  // CONNECTION POOL SETTINGS
  // ============================================

  readonly max_open_connections: number;
  readonly max_idle_connections: number;
  readonly connection_idle_timeout: number;

  // ============================================
  // CLICKHOUSE SESSION SETTINGS
  // ============================================

  readonly clickhouse_settings: ClickHouseSettings;

  // ============================================
  // TLS SETTINGS (Iteration 9)
  // ============================================

  readonly tls?: TLSSettings;

  // ============================================
  // CONSTRUCTOR
  // ============================================

  constructor(
    private readonly certProvider?: ICertificateProvider
  ) {
    // Build URL from environment or default to localhost
    this.url = this.buildUrl();

    // Authentication settings
    this.username = this.getUsername();
    this.password = this.getPassword();

    // Database name (default to 'default' database)
    this.database = process.env.CLICKHOUSE_DB || 'default';

    // Request timeout (360 seconds = 6 minutes)
    // Must exceed SQL max_execution_time (120s) to prevent socket hang up
    // Formula: HTTP_timeout > SQL_execution_time * safety_margin
    // 360s > 120s * 3 = 360s ✓
    this.request_timeout = 360000;

    // Connection pool settings from constants (DRY)
    this.max_open_connections = CLICKHOUSE_DEFAULTS.MAX_OPEN_CONNECTIONS;
    this.max_idle_connections = CLICKHOUSE_DEFAULTS.MAX_IDLE_CONNECTIONS;
    this.connection_idle_timeout = CLICKHOUSE_DEFAULTS.CONNECTION_IDLE_TIMEOUT;

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
  private buildUrl(): string {
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

  private getUsername(): string {
    const username = process.env.CLICKHOUSE_USER;

    if (!username || username.trim().length === 0) {
      return 'default';
    }

    return username.trim();
  }

  private getPassword(): string | undefined {
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
  private buildSettings(): ClickHouseSettings {
    return {
      async_insert: CLICKHOUSE_DEFAULTS.ASYNC_INSERT as 0 | 1,
      wait_for_async_insert: CLICKHOUSE_DEFAULTS.WAIT_FOR_ASYNC_INSERT as 0 | 1,
      max_insert_block_size: CLICKHOUSE_DEFAULTS.MAX_INSERT_BLOCK_SIZE,
      max_execution_time: CLICKHOUSE_DEFAULTS.MAX_EXECUTION_TIME,
      max_memory_usage: CLICKHOUSE_DEFAULTS.MAX_MEMORY_USAGE,
      max_rows_to_read: CLICKHOUSE_DEFAULTS.MAX_ROWS_TO_READ,
      max_bytes_to_read: CLICKHOUSE_DEFAULTS.MAX_BYTES_TO_READ,
      optimize_read_in_order: CLICKHOUSE_DEFAULTS.OPTIMIZE_READ_IN_ORDER as 0 | 1,
      max_threads: CLICKHOUSE_DEFAULTS.MAX_THREADS,
    };
  }

  /**
   * Build TLS settings from environment and certificate provider
   * @throws {Error} If CLICKHOUSE_SECURE=true but certificate not found
   * @returns TLS settings object or undefined (if disabled)
   */
  private buildTLSSettings(): TLSSettings | undefined {
    const secure = process.env.CLICKHOUSE_SECURE;

    if (secure !== 'true') {
      return undefined;
    }

    // Use injected provider or create default (FileSystem)
    const provider = this.certProvider || createCertificateProvider();

    try {
      const caCert = provider.getCACert();

      return {
        ca_cert: caCert,
      };
    } catch (error) {
      throw new Error(
        `TLS enabled but certificate not found. Run: npm run setup:certs`
      );
    }
  }
}

/**
 * Factory function for creating ClickHouse configuration.
 * Returns IClickHouseConfig interface (not concrete class).
 */
export function createClickHouseConfig(): IClickHouseConfig {
  return new ClickHouseConfigAdapter();
}
