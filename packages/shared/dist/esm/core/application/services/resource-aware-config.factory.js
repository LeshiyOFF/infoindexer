"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceAwareConfigService = createResourceAwareConfigService;
const resource_calculation_service_1 = require("../../domain/services/resource-calculation.service");
const resource_aware_config_service_1 = require("./resource-aware-config.service");
const cgroup_resource_discovery_adapter_1 = require("../../infrastructure/adapters/cgroup-resource-discovery.adapter");
const os_resource_discovery_adapter_1 = require("../../infrastructure/adapters/os-resource-discovery.adapter");
const config_profile_selector_adapter_1 = require("../../infrastructure/adapters/config-profile-selector.adapter");
const startup_health_check_adapter_1 = require("../../infrastructure/adapters/startup-health-check.adapter");
/**
 * Create ResourceAwareConfigService with default adapters
 */
function createResourceAwareConfigService(options = {}) {
    const resourceDiscovery = options.resourceDiscovery ?? createFallbackDiscovery();
    const profileSelector = options.profileSelector ?? new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
    const healthCheck = options.healthCheck ?? new startup_health_check_adapter_1.StartupHealthCheckAdapter();
    const calculationService = options.calculationService ?? new resource_calculation_service_1.ResourceCalculationService();
    return new resource_aware_config_service_1.ResourceAwareConfigService(resourceDiscovery, profileSelector, healthCheck, calculationService);
}
/**
 * Create fallback resource discovery (tries cgroup, then OS)
 */
function createFallbackDiscovery() {
    const cgroupAdapter = new cgroup_resource_discovery_adapter_1.CgroupResourceDiscoveryAdapter();
    try {
        cgroupAdapter.detect();
        return cgroupAdapter;
    }
    catch {
        return new os_resource_discovery_adapter_1.OSResourceDiscoveryAdapter();
    }
}
