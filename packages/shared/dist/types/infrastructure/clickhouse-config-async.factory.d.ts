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
import type { IClickHouseConfig } from './ports/i-clickhouse-config.port';
import type { ICertificateProvider } from './ports/i-certificate-provider.port';
import type { CalculatedConfig } from '../core/domain/services/resource-calculation.service';
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
export declare function createClickHouseConfigAsync(calculatedConfig?: CalculatedConfig | null, certProvider?: ICertificateProvider): Promise<IClickHouseConfig>;
