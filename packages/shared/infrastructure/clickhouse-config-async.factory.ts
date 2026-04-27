/**
 * Async ClickHouse Configuration Factory with Resource-Aware Settings
 *
 * @remarks
 * Creates ClickHouse configuration using resource-aware settings.
 * Supports both manual settings and automatic resource detection.
 *
 * Integration with Resource-Aware Configuration:
 * - Accepts CalculatedConfig from ResourceAwareConfigService
 * - Falls back to constants if no config provided
 * - Async initialization for resource detection
 */
import type {
  IClickHouseConfig,
  ClickHouseSettings,
  TLSSettings
} from './ports/i-clickhouse-config.port';
import type { ICertificateProvider } from './ports/i-certificate-provider.port';
import { CLICKHOUSE_DEFAULTS } from './clickhouse.constants';
import { createCertificateProvider } from './file-certificate-provider.adapter';
import type { CalculatedConfig } from '../core/domain/services/resource-calculation.service';

/**
 * Resource-aware ClickHouse configuration adapter
 */
class ResourceAwareClickHouseConfig implements IClickHouseConfig {
  readonly url: string;
  readonly username: string;
  readonly password: string | undefined;
  readonly database: string;
  readonly request_timeout: number;
  readonly max_open_connections: number;
  readonly max_idle_connections: number;
  readonly connection_idle_timeout: number;
  readonly clickhouse_settings: ClickHouseSettings;
  readonly tls?: TLSSettings;

  constructor(
    private readonly calculatedConfig: CalculatedConfig | null,
    private readonly certProvider?: ICertificateProvider
  ) {
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
    return username?.trim() || 'default';
  }

  private getPassword(): string | undefined {
    const password = process.env.CLICKHOUSE_PASSWORD;
    return password?.trim() || undefined;
  }

  /**
   * Calculate request timeout based on max_execution_time
   *
   * Formula: HTTP_timeout > SQL_execution_time * safety_margin (3x)
   */
  private calculateRequestTimeout(): number {
    const maxExecutionTime = this.calculatedConfig?.maxExecutionTime ?? CLICKHOUSE_DEFAULTS.MAX_EXECUTION_TIME;
    return maxExecutionTime * 3 * 1000;
  }

  /**
   * Build ClickHouse settings from calculated config or constants
   */
  private buildSettings(): ClickHouseSettings {
    const config = this.calculatedConfig;

    return {
      async_insert: CLICKHOUSE_DEFAULTS.ASYNC_INSERT as 0 | 1,
      wait_for_async_insert: CLICKHOUSE_DEFAULTS.WAIT_FOR_ASYNC_INSERT as 0 | 1,
      max_insert_block_size: CLICKHOUSE_DEFAULTS.MAX_INSERT_BLOCK_SIZE,
      max_execution_time: config?.maxExecutionTime ?? CLICKHOUSE_DEFAULTS.MAX_EXECUTION_TIME,
      max_memory_usage: config?.maxMemoryUsage ?? CLICKHOUSE_DEFAULTS.MAX_MEMORY_USAGE,
      max_rows_to_read: CLICKHOUSE_DEFAULTS.MAX_ROWS_TO_READ,
      max_bytes_to_read: CLICKHOUSE_DEFAULTS.MAX_BYTES_TO_READ,
      optimize_read_in_order: CLICKHOUSE_DEFAULTS.OPTIMIZE_READ_IN_ORDER as 0 | 1,
      max_threads: config?.maxThreads ?? CLICKHOUSE_DEFAULTS.MAX_THREADS,
    };
  }

  private buildTLSSettings(): TLSSettings | undefined {
    if (process.env.CLICKHOUSE_SECURE !== 'true') {
      return undefined;
    }

    const provider = this.certProvider || createCertificateProvider();

    try {
      const caCert = provider.getCACert();
      return { ca_cert: caCert };
    } catch (error) {
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
export async function createClickHouseConfigAsync(
  calculatedConfig: CalculatedConfig | null = null,
  certProvider?: ICertificateProvider
): Promise<IClickHouseConfig> {
  return new ResourceAwareClickHouseConfig(calculatedConfig, certProvider);
}
