"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_profile_vo_1 = require("./config-profile.vo");
(0, vitest_1.describe)('ConfigProfile', () => {
    (0, vitest_1.describe)('predefined profiles', () => {
        (0, vitest_1.it)('should have LOW profile', () => {
            const profile = config_profile_vo_1.ConfigProfile.LOW;
            (0, vitest_1.expect)(profile.type).toBe(config_profile_vo_1.ConfigProfileType.LOW);
            (0, vitest_1.expect)(profile.name).toBe('Low Memory');
            (0, vitest_1.expect)(profile.minMemoryGB).toBe(0);
            (0, vitest_1.expect)(profile.maxMemoryGB).toBe(4);
            (0, vitest_1.expect)(profile.memoryUtilization).toBe(0.5);
            (0, vitest_1.expect)(profile.maxExecutionTime).toBe(30);
            (0, vitest_1.expect)(profile.maxThreads).toBe(1);
            (0, vitest_1.expect)(profile.batchSize).toBe(100000);
            (0, vitest_1.expect)(profile.warning).toBeDefined();
        });
        (0, vitest_1.it)('should have STANDARD profile', () => {
            const profile = config_profile_vo_1.ConfigProfile.STANDARD;
            (0, vitest_1.expect)(profile.type).toBe(config_profile_vo_1.ConfigProfileType.STANDARD);
            (0, vitest_1.expect)(profile.name).toBe('Standard');
            (0, vitest_1.expect)(profile.minMemoryGB).toBe(4);
            (0, vitest_1.expect)(profile.maxMemoryGB).toBe(16);
            (0, vitest_1.expect)(profile.memoryUtilization).toBe(0.6);
            (0, vitest_1.expect)(profile.maxExecutionTime).toBe(120);
            (0, vitest_1.expect)(profile.maxThreads).toBe(2);
            (0, vitest_1.expect)(profile.batchSize).toBe(1000000);
            (0, vitest_1.expect)(profile.warning).toBeUndefined();
        });
        (0, vitest_1.it)('should have HIGH profile', () => {
            const profile = config_profile_vo_1.ConfigProfile.HIGH;
            (0, vitest_1.expect)(profile.type).toBe(config_profile_vo_1.ConfigProfileType.HIGH);
            (0, vitest_1.expect)(profile.name).toBe('High Memory');
            (0, vitest_1.expect)(profile.minMemoryGB).toBe(16);
            (0, vitest_1.expect)(profile.maxMemoryGB).toBe(Infinity);
            (0, vitest_1.expect)(profile.memoryUtilization).toBe(0.8);
            (0, vitest_1.expect)(profile.maxExecutionTime).toBe(180);
            (0, vitest_1.expect)(profile.maxThreads).toBe(4);
            (0, vitest_1.expect)(profile.batchSize).toBe(5000000);
            (0, vitest_1.expect)(profile.warning).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('selectFor', () => {
        (0, vitest_1.it)('should select LOW for < 4GB', () => {
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(2)).toBe(config_profile_vo_1.ConfigProfile.LOW);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(0.5)).toBe(config_profile_vo_1.ConfigProfile.LOW);
        });
        (0, vitest_1.it)('should select STANDARD for 4-16GB', () => {
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(4)).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(8)).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(15.9)).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
        });
        (0, vitest_1.it)('should select HIGH for > 16GB', () => {
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(16)).toBe(config_profile_vo_1.ConfigProfile.HIGH);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.selectFor(32)).toBe(config_profile_vo_1.ConfigProfile.HIGH);
        });
    });
    (0, vitest_1.describe)('matches', () => {
        (0, vitest_1.it)('should match LOW profile for 2GB', () => {
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.LOW.matches(2)).toBe(true);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.LOW.matches(4)).toBe(false);
        });
        (0, vitest_1.it)('should match STANDARD profile for 8GB', () => {
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.STANDARD.matches(8)).toBe(true);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.STANDARD.matches(4)).toBe(true);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.STANDARD.matches(16)).toBe(false);
        });
        (0, vitest_1.it)('should match HIGH profile for 32GB', () => {
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.HIGH.matches(32)).toBe(true);
            (0, vitest_1.expect)(config_profile_vo_1.ConfigProfile.HIGH.matches(16)).toBe(true);
        });
    });
    (0, vitest_1.describe)('toJSON', () => {
        (0, vitest_1.it)('should return profile data', () => {
            const profile = config_profile_vo_1.ConfigProfile.LOW;
            const data = profile.toJSON();
            (0, vitest_1.expect)(data.type).toBe(config_profile_vo_1.ConfigProfileType.LOW);
            (0, vitest_1.expect)(data.name).toBe('Low Memory');
            (0, vitest_1.expect)(data.minMemoryGB).toBe(0);
            (0, vitest_1.expect)(data.maxMemoryGB).toBe(4);
        });
    });
    (0, vitest_1.describe)('validation', () => {
        (0, vitest_1.it)('should throw on negative minMemoryGB', () => {
            (0, vitest_1.expect)(() => new config_profile_vo_1.ConfigProfile({
                type: config_profile_vo_1.ConfigProfileType.LOW,
                name: 'Invalid',
                description: 'Test',
                minMemoryGB: -1,
                maxMemoryGB: 4,
                memoryUtilization: 0.5,
                maxExecutionTime: 30,
                maxThreads: 1,
                batchSize: 100000
            })).toThrow();
        });
        (0, vitest_1.it)('should throw on maxMemoryGB < minMemoryGB', () => {
            (0, vitest_1.expect)(() => new config_profile_vo_1.ConfigProfile({
                type: config_profile_vo_1.ConfigProfileType.LOW,
                name: 'Invalid',
                description: 'Test',
                minMemoryGB: 8,
                maxMemoryGB: 4,
                memoryUtilization: 0.5,
                maxExecutionTime: 30,
                maxThreads: 1,
                batchSize: 100000
            })).toThrow();
        });
        (0, vitest_1.it)('should throw on invalid memoryUtilization', () => {
            (0, vitest_1.expect)(() => new config_profile_vo_1.ConfigProfile({
                type: config_profile_vo_1.ConfigProfileType.LOW,
                name: 'Invalid',
                description: 'Test',
                minMemoryGB: 0,
                maxMemoryGB: 4,
                memoryUtilization: 1.5,
                maxExecutionTime: 30,
                maxThreads: 1,
                batchSize: 100000
            })).toThrow();
        });
        (0, vitest_1.it)('should throw on negative maxExecutionTime', () => {
            (0, vitest_1.expect)(() => new config_profile_vo_1.ConfigProfile({
                type: config_profile_vo_1.ConfigProfileType.LOW,
                name: 'Invalid',
                description: 'Test',
                minMemoryGB: 0,
                maxMemoryGB: 4,
                memoryUtilization: 0.5,
                maxExecutionTime: -1,
                maxThreads: 1,
                batchSize: 100000
            })).toThrow();
        });
        (0, vitest_1.it)('should throw on zero maxThreads', () => {
            (0, vitest_1.expect)(() => new config_profile_vo_1.ConfigProfile({
                type: config_profile_vo_1.ConfigProfileType.LOW,
                name: 'Invalid',
                description: 'Test',
                minMemoryGB: 0,
                maxMemoryGB: 4,
                memoryUtilization: 0.5,
                maxExecutionTime: 30,
                maxThreads: 0,
                batchSize: 100000
            })).toThrow();
        });
        (0, vitest_1.it)('should throw on zero batchSize', () => {
            (0, vitest_1.expect)(() => new config_profile_vo_1.ConfigProfile({
                type: config_profile_vo_1.ConfigProfileType.LOW,
                name: 'Invalid',
                description: 'Test',
                minMemoryGB: 0,
                maxMemoryGB: 4,
                memoryUtilization: 0.5,
                maxExecutionTime: 30,
                maxThreads: 1,
                batchSize: 0
            })).toThrow();
        });
    });
    (0, vitest_1.describe)('all', () => {
        (0, vitest_1.it)('should return all profiles', () => {
            const profiles = config_profile_vo_1.ConfigProfile.all();
            (0, vitest_1.expect)(profiles).toHaveLength(3);
            (0, vitest_1.expect)(profiles).toContain(config_profile_vo_1.ConfigProfile.LOW);
            (0, vitest_1.expect)(profiles).toContain(config_profile_vo_1.ConfigProfile.STANDARD);
            (0, vitest_1.expect)(profiles).toContain(config_profile_vo_1.ConfigProfile.HIGH);
        });
    });
});
