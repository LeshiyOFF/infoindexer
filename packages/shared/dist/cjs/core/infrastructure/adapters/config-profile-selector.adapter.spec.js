"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_profile_selector_adapter_1 = require("./config-profile-selector.adapter");
const resource_info_vo_1 = require("../../domain/value-objects/resource-info.vo");
const config_profile_vo_1 = require("../../domain/value-objects/config-profile.vo");
(0, vitest_1.describe)('ConfigProfileSelectorAdapter', () => {
    let adapter;
    const originalEnv = process.env.CONFIG_PROFILE;
    (0, vitest_1.beforeEach)(() => {
        adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
    });
    (0, vitest_1.afterEach)(() => {
        process.env.CONFIG_PROFILE = originalEnv;
    });
    (0, vitest_1.describe)('select', () => {
        (0, vitest_1.it)('should select LOW for 2GB without override', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(2);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.LOW);
        });
        (0, vitest_1.it)('should select STANDARD for 8GB without override', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(8);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
        });
        (0, vitest_1.it)('should select HIGH for 32GB without override', () => {
            const resources = resource_info_vo_1.ResourceInfo.fromGB(32);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.HIGH);
        });
    });
    (0, vitest_1.describe)('with override', () => {
        (0, vitest_1.beforeEach)(() => {
            process.env.CONFIG_PROFILE = 'low';
        });
        (0, vitest_1.it)('should use override from env', () => {
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            const resources = resource_info_vo_1.ResourceInfo.fromGB(32);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.LOW);
        });
        (0, vitest_1.it)('should accept "low-memory" alias', () => {
            process.env.CONFIG_PROFILE = 'low-memory';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            const resources = resource_info_vo_1.ResourceInfo.fromGB(32);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.LOW);
        });
        (0, vitest_1.it)('should accept "standard" alias', () => {
            process.env.CONFIG_PROFILE = 'standard';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            const resources = resource_info_vo_1.ResourceInfo.fromGB(2);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
        });
        (0, vitest_1.it)('should accept "default" alias', () => {
            process.env.CONFIG_PROFILE = 'default';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            const resources = resource_info_vo_1.ResourceInfo.fromGB(2);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
        });
        (0, vitest_1.it)('should accept "high-memory" alias', () => {
            process.env.CONFIG_PROFILE = 'high-memory';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            const resources = resource_info_vo_1.ResourceInfo.fromGB(2);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.HIGH);
        });
        (0, vitest_1.it)('should warn on unknown override', () => {
            const consoleWarn = vitest_1.vi.spyOn(console, 'warn').mockImplementation(() => { });
            process.env.CONFIG_PROFILE = 'unknown';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            const resources = resource_info_vo_1.ResourceInfo.fromGB(8);
            const profile = adapter.select(resources);
            (0, vitest_1.expect)(profile).toBe(config_profile_vo_1.ConfigProfile.STANDARD);
            (0, vitest_1.expect)(consoleWarn).toHaveBeenCalledWith('Unknown CONFIG_PROFILE: unknown, using auto-selection');
            consoleWarn.mockRestore();
        });
    });
    (0, vitest_1.describe)('getProfileTypeName', () => {
        (0, vitest_1.it)('should return type name as string', () => {
            const name = adapter.getProfileTypeName(config_profile_vo_1.ConfigProfile.LOW);
            (0, vitest_1.expect)(name).toBe('low');
        });
    });
    (0, vitest_1.describe)('isOverridden', () => {
        (0, vitest_1.it)('should return false when no override', () => {
            (0, vitest_1.expect)(adapter.isOverridden()).toBe(false);
        });
        (0, vitest_1.it)('should return true when override set', () => {
            process.env.CONFIG_PROFILE = 'low';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            (0, vitest_1.expect)(adapter.isOverridden()).toBe(true);
        });
    });
    (0, vitest_1.describe)('getOverride', () => {
        (0, vitest_1.it)('should return undefined when no override', () => {
            (0, vitest_1.expect)(adapter.getOverride()).toBeUndefined();
        });
        (0, vitest_1.it)('should return override value', () => {
            process.env.CONFIG_PROFILE = 'high';
            const adapter = new config_profile_selector_adapter_1.ConfigProfileSelectorAdapter();
            (0, vitest_1.expect)(adapter.getOverride()).toBe('high');
        });
    });
});
