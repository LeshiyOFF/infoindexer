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
export class ResourceAwareConfigService {
  private initialized = false;
  private cachedResources: ResourceInfo | null = null;
  private cachedProfile: ConfigProfile | null = null;
  private cachedConfig: CalculatedConfig | null = null;

  constructor(
    private readonly resourceDiscovery: IResourceDiscoveryPort,
    private readonly profileSelector: IConfigProfileSelectorPort,
    private readonly healthCheck: IStartupHealthCheckPort,
    private readonly calculationService: ResourceCalculationService = new ResourceCalculationService()
  ) {}

  /**
   * Initialize resource-aware configuration
   *
   * @returns Initialization result with status and config
   * @throws Error if resources are insufficient
   */
  async initialize(): Promise<InitializationResult> {
    const resources = await this.detectResources();
    const profile = this.selectProfile(resources);
    const healthStatus = this.validateResources(resources);
    const config = this.calculateConfig(resources, profile);

    this.cachedResources = resources;
    this.cachedProfile = profile;
    this.cachedConfig = config;
    this.initialized = true;

    return {
      status: healthStatus.status,
      resources,
      profile,
      config,
      warning: healthStatus.status === 'degraded' ? healthStatus.warning : undefined
    };
  }

  /**
   * Detect system resources
   */
  async detectResources(): Promise<ResourceInfo> {
    return await this.resourceDiscovery.detect();
  }

  /**
   * Select configuration profile
   */
  selectProfile(resources: ResourceInfo): ConfigProfile {
    return this.profileSelector.select(resources);
  }

  /**
   * Validate resources
   */
  validateResources(resources: ResourceInfo): HealthStatus {
    return this.healthCheck.validate(resources);
  }

  /**
   * Calculate configuration
   */
  calculateConfig(resources: ResourceInfo, profile: ConfigProfile): CalculatedConfig {
    return this.calculationService.calculate(resources, profile);
  }

  /**
   * Get cached resources (must call initialize first)
   */
  getResources(): ResourceInfo {
    this.ensureInitialized();
    return this.cachedResources!;
  }

  /**
   * Get cached profile (must call initialize first)
   */
  getProfile(): ConfigProfile {
    this.ensureInitialized();
    return this.cachedProfile!;
  }

  /**
   * Get cached config (must call initialize first)
   */
  getConfig(): CalculatedConfig {
    this.ensureInitialized();
    return this.cachedConfig!;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get ClickHouse settings for current config
   */
  getClickHouseSettings(): {
    max_memory_usage: string;
    max_execution_time: number;
    max_threads: number;
  } {
    const config = this.getConfig();

    return {
      max_memory_usage: config.maxMemoryUsage,
      max_execution_time: config.maxExecutionTime,
      max_threads: config.maxThreads
    };
  }

  /**
   * Get health report
   */
  getHealthReport(): string {
    const resources = this.getResources();
    const profile = this.getProfile();

    const maxMemoryGB = profile.maxMemoryGB === Infinity
      ? 'Unlimited'
      : `${(profile.maxMemoryGB * profile.memoryUtilization).toFixed(1)}GB`;

    const lines = [
      '=== Resource-Aware Configuration ===',
      `Memory: ${resources.totalMemory.format()} (${resources.source})`,
      `Profile: ${profile.name}`,
      `Max Memory: ${maxMemoryGB} (${profile.memoryUtilization * 100}%)`,
      `Max Threads: ${profile.maxThreads}`,
      `Batch Size: ${profile.batchSize.toLocaleString()} records`,
      '====================================='
    ];

    return lines.join('\n');
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'ResourceAwareConfigService not initialized. ' +
        'Call await initialize() first.'
      );
    }
  }

  /**
   * Reset cache (useful for testing)
   */
  reset(): void {
    this.initialized = false;
    this.cachedResources = null;
    this.cachedProfile = null;
    this.cachedConfig = null;
  }
}
