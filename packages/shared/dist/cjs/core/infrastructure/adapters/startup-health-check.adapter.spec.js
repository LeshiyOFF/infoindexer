"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const startup_health_check_adapter_1 = require("./startup-health-check.adapter");
const resource_info_vo_1 = require("../../domain/value-objects/resource-info.vo");
const config_profile_vo_1 = require("../../domain/value-objects/config-profile.vo");
(0, vitest_1.describe)('StartupHealthCheckAdapter', () => {
    let adapter;
    beforeEach(() => {
        adapter = new startup_health_check_adapter_1.StartupHealthCheckAdapter();
    });
    (0, vitest_1.describe)('validate', () => {
        (0, vitest_1.it)('should return unhealthy for < 2GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(1);
            const status = adapter.validate(resources);
            (0, vitest_1.expect)(status.status).toBe('unhealthy');
            if (status.status === 'unhealthy') {
                (0, vitest_1.expect)(status.reason).toContain('Insufficient memory');
                (0, vitest_1.expect)(status.action).toContain('Upgrade');
            }
        });
        (0, vitest_1.it)('should return degraded for 2-4GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(3);
            const status = adapter.validate(resources);
            (0, vitest_1.expect)(status.status).toBe('degraded');
            if (status.status === 'degraded') {
                (0, vitest_1.expect)(status.profile).toBe(config_profile_vo_1.ConfigProfile.LOW);
                (0, vitest_1.expect)(status.warning).toContain('Low memory mode');
            }
        });
        (0, vitest_1.it)('should return degraded for 4-8GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(6);
            const status = adapter.validate(resources);
            (0, vitest_1.expect)(status.status).toBe('degraded');
            if (status.status === 'degraded') {
                (0, vitest_1.expect)(status.profile).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
                (0, vitest_1.expect)(status.warning).toContain('Standard mode');
            }
        });
        (0, vitest_1.it)('should return healthy for > 8GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(16);
            const status = adapter.validate(resources);
            (0, vitest_1.expect)(status.status).toBe('healthy');
            if (status.status === 'healthy') {
                (0, vitest_1.expect)(status.profile).toBe(config_profile_vo_1.ConfigProfile.HIGH);
            }
        });
    });
    (0, vitest_1.describe)('isSufficient', () => {
        (0, vitest_1.it)('should return false for < 2GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(1);
            (0, vitest_1.expect)(adapter.isSufficient(resources)).toBe(false);
        });
        (0, vitest_1.it)('should return true for >= 2GB', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(4);
            (0, vitest_1.expect)(adapter.isSufficient(resources)).toBe(true);
        });
    });
    (0, vitest_1.describe)('getReport', () => {
        (0, vitest_1.it)('should generate report for unhealthy', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(1);
            const report = adapter.getReport(resources);
            (0, vitest_1.expect)(report).toContain('UNHEALTHY');
            (0, vitest_1.expect)(report).toContain('1.0GB');
            (0, vitest_1.expect)(report).toContain('Insufficient memory');
            (0, vitest_1.expect)(report).toContain('Action:');
        });
        (0, vitest_1.it)('should generate report for degraded', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(3);
            const report = adapter.getReport(resources);
            (0, vitest_1.expect)(report).toContain('DEGRADED');
            (0, vitest_1.expect)(report).toContain('3.0GB');
            (0, vitest_1.expect)(report).toContain('Low Memory');
            (0, vitest_1.expect)(report).toContain('Warning:');
        });
        (0, vitest_1.it)('should generate report for healthy', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(16);
            const report = adapter.getReport(resources);
            (0, vitest_1.expect)(report).toContain('HEALTHY');
            (0, vitest_1.expect)(report).toContain('16.0GB');
            (0, vitest_1.expect)(report).toContain('High Memory');
        });
    });
});
