import type { ClickHouseClient } from '@clickhouse/client';
import type { InitializationResult } from 'shared';
/**
 * Application initialization result
 */
export interface AppInitializationResult {
    readonly clickhouseClient: ClickHouseClient;
    readonly resourceConfig: InitializationResult;
}
/**
 * Initialize ClickHouse client with resource-aware configuration
 *
 * @throws {Error} If resources are insufficient (unhealthy status)
 * @returns ClickHouse client and resource configuration
 *
 * @remarks
 * Process:
 * 1. Detect available resources (cgroup v1/v2, OS fallback)
 * 2. Select appropriate profile (LOW/STANDARD/HIGH)
 * 3. Validate resources (fail-fast for < 2GB)
 * 4. Calculate ClickHouse settings
 * 5. Create ClickHouse client with calculated settings
 */
export declare function initializeApp(): Promise<AppInitializationResult>;
