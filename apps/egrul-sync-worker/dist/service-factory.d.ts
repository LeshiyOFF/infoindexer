/**
 * Service Factory
 *
 * @remarks
 * Creates and initializes all application services.
 * Keeps main index.ts small and focused.
 */
import type { SocksProxyAgent } from 'socks-proxy-agent';
import type { AppState } from './app-state';
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Initialize all application services
 */
export declare function initializeServices(clickhouseClient: ClickHouseClient, proxyAgent: SocksProxyAgent | null): Promise<AppState>;
