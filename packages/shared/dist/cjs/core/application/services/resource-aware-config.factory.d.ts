/**
 * Factory for ResourceAwareConfigService
 *
 * @remarks
 * Creates service with appropriate resource discovery adapter.
 * Tries cgroup first, falls back to OS detection.
 */
import type { IResourceDiscoveryPort } from '../../infrastructure/ports/i-resource-discovery.port';
import type { IConfigProfileSelectorPort } from '../../infrastructure/ports/i-config-profile-selector.port';
import type { IStartupHealthCheckPort } from '../../infrastructure/ports/i-startup-health-check.port';
import { ResourceCalculationService } from '../../domain/services/resource-calculation.service';
import { ResourceAwareConfigService } from './resource-aware-config.service';
export interface ResourceAwareConfigServiceOptions {
    resourceDiscovery?: IResourceDiscoveryPort;
    profileSelector?: IConfigProfileSelectorPort;
    healthCheck?: IStartupHealthCheckPort;
    calculationService?: ResourceCalculationService;
}
/**
 * Create ResourceAwareConfigService with default adapters
 */
export declare function createResourceAwareConfigService(options?: ResourceAwareConfigServiceOptions): ResourceAwareConfigService;
