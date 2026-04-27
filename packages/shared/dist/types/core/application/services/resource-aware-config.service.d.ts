/**
 * Resource-Aware Configuration Service
 *
 * @remarks
 * Orchestrates resource detection, profile selection, and configuration calculation.
 * Provides adaptive ClickHouse settings based on available system memory.
 *
 * Architecture:
 * - Uses IResourceDiscoveryPort to detect resources
 * - Uses IConfigProfileSelectorPort to select profile
 * - Uses ResourceCalculationService to calculate config
 * - Uses IStartupHealthCheckPort to validate resources
 *
 * Follows DIP: depends on ports, not concrete adapters.
 */
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ConfigProfile } from '../../domain/value-objects/config-profile.vo';
import { ResourceCalculationService, CalculatedConfig } from '../../domain/services/resource-calculation.service';
import type { IResourceDiscoveryPort } from '../../infrastructure/ports/i-resource-discovery.port';
import type { IConfigProfileSelectorPort } from '../../infrastructure/ports/i-config-profile-selector.port';
import type { IStartupHealthCheckPort, HealthStatus } from '../../infrastructure/ports/i-startup-health-check.port';
/**
 * Initialization result
 */
export interface InitializationResult {
    readonly status: HealthStatus['status'];
    readonly resources: ResourceInfo;
    readonly profile: ConfigProfile;
    readonly config: CalculatedConfig;
    readonly warning?: string;
}
/**
 * Resource-Aware Configuration Service
 */
export declare class ResourceAwareConfigService {
    private readonly resourceDiscovery;
    private readonly profileSelector;
    private readonly healthCheck;
    private readonly calculationService;
    private initialized;
    private cachedResources;
    private cachedProfile;
    private cachedConfig;
    constructor(resourceDiscovery: IResourceDiscoveryPort, profileSelector: IConfigProfileSelectorPort, healthCheck: IStartupHealthCheckPort, calculationService?: ResourceCalculationService);
    /**
     * Initialize resource-aware configuration
     *
     * @returns Initialization result with status and config
     * @throws Error if resources are insufficient
     */
    initialize(): Promise<InitializationResult>;
    /**
     * Detect system resources
     */
    detectResources(): Promise<ResourceInfo>;
    /**
     * Select configuration profile
     */
    selectProfile(resources: ResourceInfo): ConfigProfile;
    /**
     * Validate resources
     */
    validateResources(resources: ResourceInfo): HealthStatus;
    /**
     * Calculate configuration
     */
    calculateConfig(resources: ResourceInfo, profile: ConfigProfile): CalculatedConfig;
    /**
     * Get cached resources (must call initialize first)
     */
    getResources(): ResourceInfo;
    /**
     * Get cached profile (must call initialize first)
     */
    getProfile(): ConfigProfile;
    /**
     * Get cached config (must call initialize first)
     */
    getConfig(): CalculatedConfig;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
    /**
     * Get ClickHouse settings for current config
     */
    getClickHouseSettings(): {
        max_memory_usage: string;
        max_execution_time: number;
        max_threads: number;
    };
    /**
     * Get health report
     */
    getHealthReport(): string;
    private ensureInitialized;
    /**
     * Reset cache (useful for testing)
     */
    reset(): void;
}
