import { selectConfigProfile } from '../../domain/value-objects/config-profile.utils';
import { LOW, STANDARD, HIGH } from '../../domain/value-objects/config-profile.constants';
/**
 * Config Profile Selector Adapter
 */
export class ConfigProfileSelectorAdapter {
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
        return selectConfigProfile(resources.totalMemoryGB);
    }
    /**
     * Select profile by environment override
     */
    selectOverride(profile) {
        const normalized = profile.toLowerCase();
        switch (normalized) {
            case 'low':
            case 'low-memory':
                return LOW;
            case 'standard':
            case 'default':
                return STANDARD;
            case 'high':
            case 'high-memory':
                return HIGH;
            default:
                console.warn(`Unknown CONFIG_PROFILE: ${profile}, using auto-selection`);
                return STANDARD;
        }
    }
    /**
     * Get current profile type name
     */
    getProfileTypeName(profile) {
        return profile.type;
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
