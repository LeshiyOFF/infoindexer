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
import { ConfigProfileType } from '../../domain/value-objects/config-profile-type.enum';
import { selectConfigProfile } from '../../domain/value-objects/config-profile.utils';
import { LOW, STANDARD, HIGH } from '../../domain/value-objects/config-profile.constants';

/**
 * Config Profile Selector Adapter
 */
export class ConfigProfileSelectorAdapter implements IConfigProfileSelectorPort {
  private readonly envOverride: string | undefined;

  constructor() {
    this.envOverride = process.env.CONFIG_PROFILE;
  }

  /**
   * Select profile for given resources
   */
  select(resources: ResourceInfo): ConfigProfile {
    if (this.envOverride) {
      return this.selectOverride(this.envOverride);
    }

    return selectConfigProfile(resources.totalMemoryGB);
  }

  /**
   * Select profile by environment override
   */
  private selectOverride(profile: string): ConfigProfile {
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
  getProfileTypeName(profile: ConfigProfile): string {
    return profile.type as string;
  }

  /**
   * Check if profile is overridden
   */
  isOverridden(): boolean {
    return this.envOverride !== undefined;
  }

  /**
   * Get override value
   */
  getOverride(): string | undefined {
    return this.envOverride;
  }
}
