/**
 * Config Profile Selector Adapter
 *
 * @remarks
 * Selects appropriate configuration profile based on available resources.
 * Can be overridden via NODE_ENV for explicit profile selection.
 *
 * Implements IConfigProfileSelectorPort following Dependency Inversion.
 */
import { IConfigProfileSelectorPort } from '../ports/i-config-profile-selector.port';
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ConfigProfile } from '../../domain/value-objects/config-profile.vo';
/**
 * Config Profile Selector Adapter
 */
export declare class ConfigProfileSelectorAdapter implements IConfigProfileSelectorPort {
    private readonly envOverride;
    constructor();
    /**
     * Select profile for given resources
     */
    select(resources: ResourceInfo): ConfigProfile;
    /**
     * Select profile by environment override
     */
    private selectOverride;
    /**
     * Get current profile type name
     */
    getProfileTypeName(profile: ConfigProfile): string;
    /**
     * Check if profile is overridden
     */
    isOverridden(): boolean;
    /**
     * Get override value
     */
    getOverride(): string | undefined;
}
