"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resource_calculation_service_1 = require("./resource-calculation.service");
const resource_info_vo_1 = require("../value-objects/resource-info.vo");
const config_profile_vo_1 = require("../value-objects/config-profile.vo");
(0, vitest_1.describe)('ResourceCalculationService', () => {
    let service;
    beforeEach(() => {
        service = new resource_calculation_service_1.ResourceCalculationService();
    });
    (0, vitest_1.describe)('calculate', () => {
        (0, vitest_1.it)('should calculate for LOW profile', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(2);
            const profile = config_profile_vo_1.ConfigProfile.LOW;
            const config = service.calculate(resources, profile);
            (0, vitest_1.expect)(config.maxMemoryUsage).toBe('1073741824'); // 1GB
            (0, vitest_1.expect)(config.maxExecutionTime).toBe(30);
            (0, vitest_1.expect)(config.maxThreads).toBe(1);
            (0, vitest_1.expect)(config.batchSize).toBe(100000);
        });
        (0, vitest_1.it)('should calculate for STANDARD profile', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(8);
            const profile = config_profile_vo_1.ConfigProfile.STANDARD;
            const config = service.calculate(resources, profile);
            (0, vitest_1.expect)(config.maxMemoryUsage).toBe('5153960755'); // ~4.8GB
            (0, vitest_1.expect)(config.maxExecutionTime).toBe(120);
            (0, vitest_1.expect)(config.maxThreads).toBe(2);
            (0, vitest_1.expect)(config.batchSize).toBe(1000000);
        });
        (0, vitest_1.it)('should calculate for HIGH profile', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(32);
            const profile = config_profile_vo_1.ConfigProfile.HIGH;
            const config = service.calculate(resources, profile);
            (0, vitest_1.expect)(config.maxMemoryUsage).toBe('27487790694'); // ~25.6GB
            (0, vitest_1.expect)(config.maxExecutionTime).toBe(180);
            (0, vitest_1.expect)(config.maxThreads).toBe(4);
            (0, vitest_1.expect)(config.batchSize).toBe(5000000);
        });
    });
    (0, vitest_1.describe)('calculateBatchSize', () => {
        (0, vitest_1.it)('should return small batch for low memory', () => {
            const size = service.calculateBatchSize(2);
            (0, vitest_1.expect)(size).toBe(100000);
        });
        (0, vitest_1.it)('should return medium batch for standard memory', () => {
            const size = service.calculateBatchSize(8);
            (0, vitest_1.expect)(size).toBeGreaterThan(100000);
            (0, vitest_1.expect)(size).toBeLessThanOrEqual(10000000);
        });
        (0, vitest_1.it)('should return large batch for high memory', () => {
            const size = service.calculateBatchSize(32);
            (0, vitest_1.expect)(size).toBeGreaterThan(1000000);
            (0, vitest_1.expect)(size).toBeLessThanOrEqual(10000000);
        });
    });
    (0, vitest_1.describe)('calculateMaxExecutionTime', () => {
        (0, vitest_1.it)('should return 30s for < 4GB', () => {
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(2)).toBe(30);
        });
        (0, vitest_1.it)('should return 60s for 4-8GB', () => {
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(4)).toBe(60);
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(6)).toBe(60);
        });
        (0, vitest_1.it)('should return 120s for 8-16GB', () => {
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(8)).toBe(120);
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(12)).toBe(120);
        });
        (0, vitest_1.it)('should return 180s for > 16GB', () => {
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(16)).toBe(180);
            (0, vitest_1.expect)(service.calculateMaxExecutionTime(32)).toBe(180);
        });
    });
    (0, vitest_1.describe)('calculateMaxThreads', () => {
        (0, vitest_1.it)('should return 1 for < 4GB', () => {
            (0, vitest_1.expect)(service.calculateMaxThreads(2)).toBe(1);
        });
        (0, vitest_1.it)('should return 2 for 4-8GB', () => {
            (0, vitest_1.expect)(service.calculateMaxThreads(4)).toBe(2);
        });
        (0, vitest_1.it)('should return 4 for 8-16GB', () => {
            (0, vitest_1.expect)(service.calculateMaxThreads(8)).toBe(4);
        });
        (0, vitest_1.it)('should return 8 for > 16GB', () => {
            (0, vitest_1.expect)(service.calculateMaxThreads(32)).toBe(8);
        });
    });
    (0, vitest_1.describe)('calculateMemoryUtilization', () => {
        (0, vitest_1.it)('should return 0.5 for < 4GB', () => {
            (0, vitest_1.expect)(service.calculateMemoryUtilization(2)).toBe(0.5);
        });
        (0, vitest_1.it)('should return 0.6 for 4-8GB', () => {
            (0, vitest_1.expect)(service.calculateMemoryUtilization(4)).toBe(0.6);
        });
        (0, vitest_1.it)('should return 0.8 for > 8GB', () => {
            (0, vitest_1.expect)(service.calculateMemoryUtilization(16)).toBe(0.8);
        });
    });
    (0, vitest_1.describe)('validateMinimumRequirements', () => {
        (0, vitest_1.it)('should pass for sufficient memory', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(4);
            (0, vitest_1.expect)(service.validateMinimumRequirements(resources)).toBe(true);
        });
        (0, vitest_1.it)('should throw for insufficient memory', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(1);
            (0, vitest_1.expect)(() => service.validateMinimumRequirements(resources)).toThrow();
        });
    });
    (0, vitest_1.describe)('getRecommendation', () => {
        (0, vitest_1.it)('should recommend upgrade for < 2GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(1);
            const rec = service.getRecommendation(resources);
            (0, vitest_1.expect)(rec).toContain('Upgrade to at least 2GB');
        });
        (0, vitest_1.it)('should warn for 2-4GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(3);
            const rec = service.getRecommendation(resources);
            (0, vitest_1.expect)(rec).toContain('Low memory mode');
        });
        (0, vitest_1.it)('should suggest improvement for 4-8GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(6);
            const rec = service.getRecommendation(resources);
            (0, vitest_1.expect)(rec).toContain('8GB+');
        });
        (0, vitest_1.it)('should indicate sufficient for > 8GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(16);
            const rec = service.getRecommendation(resources);
            (0, vitest_1.expect)(rec).toContain('Sufficient memory');
        });
    });
});
