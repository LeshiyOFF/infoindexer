"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAwareConfigService = void 0;
const resource_calculation_service_1 = require("../../domain/services/resource-calculation.service");
/**
 * Resource-Aware Configuration Service
 */
class ResourceAwareConfigService {
    resourceDiscovery;
    profileSelector;
    healthCheck;
    calculationService;
    initialized = false;
    cachedResources = null;
    cachedProfile = null;
    cachedConfig = null;
    constructor(resourceDiscovery, profileSelector, healthCheck, calculationService = new resource_calculation_service_1.ResourceCalculationService()) {
        this.resourceDiscovery = resourceDiscovery;
        this.profileSelector = profileSelector;
        this.healthCheck = healthCheck;
        this.calculationService = calculationService;
    }
    /**
     * Initialize resource-aware configuration
     *
     * @returns Initialization result with status and config
     * @throws Error if resources are insufficient
     */
    async initialize() {
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
    async detectResources() {
        return await this.resourceDiscovery.detect();
    }
    /**
     * Select configuration profile
     */
    selectProfile(resources) {
        return this.profileSelector.select(resources);
    }
    /**
     * Validate resources
     */
    validateResources(resources) {
        return this.healthCheck.validate(resources);
    }
    /**
     * Calculate configuration
     */
    calculateConfig(resources, profile) {
        return this.calculationService.calculate(resources, profile);
    }
    /**
     * Get cached resources (must call initialize first)
     */
    getResources() {
        this.ensureInitialized();
        return this.cachedResources;
    }
    /**
     * Get cached profile (must call initialize first)
     */
    getProfile() {
        this.ensureInitialized();
        return this.cachedProfile;
    }
    /**
     * Get cached config (must call initialize first)
     */
    getConfig() {
        this.ensureInitialized();
        return this.cachedConfig;
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get ClickHouse settings for current config
     */
    getClickHouseSettings() {
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
    getHealthReport() {
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
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('ResourceAwareConfigService not initialized. ' +
                'Call await initialize() first.');
        }
    }
    /**
     * Reset cache (useful for testing)
     */
    reset() {
        this.initialized = false;
        this.cachedResources = null;
        this.cachedProfile = null;
        this.cachedConfig = null;
    }
}
exports.ResourceAwareConfigService = ResourceAwareConfigService;
