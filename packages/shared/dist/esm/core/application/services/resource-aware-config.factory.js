import { ResourceCalculationService } from '../../domain/services/resource-calculation.service';
import { ResourceAwareConfigService } from './resource-aware-config.service';
import { CgroupResourceDiscoveryAdapter } from '../../infrastructure/adapters/cgroup-resource-discovery.adapter';
import { OSResourceDiscoveryAdapter } from '../../infrastructure/adapters/os-resource-discovery.adapter';
import { ConfigProfileSelectorAdapter } from '../../infrastructure/adapters/config-profile-selector.adapter';
import { StartupHealthCheckAdapter } from '../../infrastructure/adapters/startup-health-check.adapter';
/**
 * Create ResourceAwareConfigService with default adapters
 */
export function createResourceAwareConfigService(options = {}) {
    const resourceDiscovery = options.resourceDiscovery ?? createFallbackDiscovery();
    const profileSelector = options.profileSelector ?? new ConfigProfileSelectorAdapter();
    const healthCheck = options.healthCheck ?? new StartupHealthCheckAdapter();
    const calculationService = options.calculationService ?? new ResourceCalculationService();
    return new ResourceAwareConfigService(resourceDiscovery, profileSelector, healthCheck, calculationService);
}
/**
 * Create fallback resource discovery (tries cgroup, then OS)
 */
function createFallbackDiscovery() {
    const cgroupAdapter = new CgroupResourceDiscoveryAdapter();
    try {
        cgroupAdapter.detect();
        return cgroupAdapter;
    }
    catch {
        return new OSResourceDiscoveryAdapter();
    }
}
