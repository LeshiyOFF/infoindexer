"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = initializeApp;
/**
 * Application Initializer with Resource-Aware Configuration
 *
 * @remarks
 * Initializes ClickHouse client with resource-aware settings.
 * Handles health check failures and degraded states.
 *
 * Integration:
 * - ResourceAwareConfigService detects resources and selects profile
 * - ClickHouse client configured with calculated settings
 * - Health status logged on startup
 */
const client_1 = require("@clickhouse/client");
const shared_1 = require("shared");
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
async function initializeApp() {
    const configService = (0, shared_1.createResourceAwareConfigService)();
    console.log('=== Resource-Aware Configuration ===');
    console.log('Detecting system resources...');
    const result = await configService.initialize();
    // Log resource detection
    console.log(`Memory: ${result.resources.totalMemory.format()} (${result.resources.source})`);
    console.log(`Profile: ${result.profile.name}`);
    console.log(`Max Memory: ${result.config.maxMemoryUsage} (${result.profile.memoryUtilization * 100}%)`);
    console.log(`Max Execution Time: ${result.config.maxExecutionTime}s`);
    console.log(`Max Threads: ${result.config.maxThreads}`);
    console.log(`Batch Size: ${result.profile.batchSize.toLocaleString()} records`);
    // Handle health status
    if (result.status === 'unhealthy') {
        console.error('!!! RESOURCE CHECK FAILED !!!');
        console.error('Insufficient memory for operation. Minimum 2GB required.');
        console.error(`Available: ${result.resources.totalMemory.format()}`);
        throw new Error(`Insufficient resources: ${result.resources.totalMemory.format()} ` +
            `(minimum 2GB required)`);
    }
    if (result.warning) {
        console.warn(`!!! WARNING: ${result.warning}`);
    }
    console.log('Resource check: HEALTHY');
    console.log('=====================================');
    // Create ClickHouse config with calculated settings
    const clickhouseConfig = await (0, shared_1.createClickHouseConfigAsync)(result.config);
    // Create ClickHouse client
    const clickhouseClient = (0, client_1.createClient)(clickhouseConfig);
    console.log('ClickHouse client initialized with resource-aware settings');
    return {
        clickhouseClient,
        resourceConfig: result
    };
}
