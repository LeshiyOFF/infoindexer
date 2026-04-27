"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigProfileSelectorAdapter = void 0;
const config_profile_vo_1 = require("../../domain/value-objects/config-profile.vo");
/**
 * Config Profile Selector Adapter
 */
class ConfigProfileSelectorAdapter {
    envOverride;
    constructor() {
        this.envOverride = process.env.CONFIG_PROFILE;
    }
    /**
     * Select profile for given resources
     */
    select(resources) {
        if (this.envOverride) {
            return this.selectOverride(this.envOverride);
        }
        return config_profile_vo_1.ConfigProfile.selectFor(resources.totalMemoryGB);
    }
    /**
     * Select profile by environment override
     */
    selectOverride(profile) {
        const normalized = profile.toLowerCase();
        switch (normalized) {
            case 'low':
            case 'low-memory':
                return config_profile_vo_1.ConfigProfile.LOW;
            case 'standard':
            case 'default':
                return config_profile_vo_1.ConfigProfile.STANDARD;
            case 'high':
            case 'high-memory':
                return config_profile_vo_1.ConfigProfile.HIGH;
            default:
                console.warn(`Unknown CONFIG_PROFILE: ${profile}, using auto-selection`);
                return config_profile_vo_1.ConfigProfile.STANDARD;
        }
    }
    /**
     * Get current profile type name
     */
    getProfileTypeName(profile) {
        return config_profile_vo_1.ConfigProfileType[profile.type].toUpperCase();
    }
    /**
     * Check if profile is overridden
     */
    isOverridden() {
        return this.envOverride !== undefined;
    }
    /**
     * Get override value
     */
    getOverride() {
        return this.envOverride;
    }
}
exports.ConfigProfileSelectorAdapter = ConfigProfileSelectorAdapter;
