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
import { CgroupResourceDiscoveryAdapter } from '../../infrastructure/adapters/cgroup-resource-discovery.adapter';
import { OSResourceDiscoveryAdapter } from '../../infrastructure/adapters/os-resource-discovery.adapter';
import { ConfigProfileSelectorAdapter } from '../../infrastructure/adapters/config-profile-selector.adapter';
import { StartupHealthCheckAdapter } from '../../infrastructure/adapters/startup-health-check.adapter';

export interface ResourceAwareConfigServiceOptions {
  resourceDiscovery?: IResourceDiscoveryPort;
  profileSelector?: IConfigProfileSelectorPort;
  healthCheck?: IStartupHealthCheckPort;
  calculationService?: ResourceCalculationService;
}

/**
 * Create ResourceAwareConfigService with default adapters
 */
export function createResourceAwareConfigService(
  options: ResourceAwareConfigServiceOptions = {}
): ResourceAwareConfigService {
  const resourceDiscovery = options.resourceDiscovery ?? createFallbackDiscovery();
  const profileSelector = options.profileSelector ?? new ConfigProfileSelectorAdapter();
  const healthCheck = options.healthCheck ?? new StartupHealthCheckAdapter();
  const calculationService = options.calculationService ?? new ResourceCalculationService();

  return new ResourceAwareConfigService(
    resourceDiscovery,
    profileSelector,
    healthCheck,
    calculationService
  );
}

/**
 * Create fallback resource discovery (tries cgroup, then OS)
 */
function createFallbackDiscovery(): IResourceDiscoveryPort {
  const cgroupAdapter = new CgroupResourceDiscoveryAdapter();

  try {
    cgroupAdapter.detect();
    return cgroupAdapter;
  } catch {
    return new OSResourceDiscoveryAdapter();
  }
}
