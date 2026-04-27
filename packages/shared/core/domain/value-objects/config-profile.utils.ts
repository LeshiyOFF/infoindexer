/**
 * Config Profile Utilities
 *
 * @remarks
 * Factory functions for ConfigProfile.
 * Separated from class to avoid circular dependency.
 */

import { ConfigProfile } from './config-profile.vo';
import { LOW, STANDARD, HIGH, ALL_PROFILES } from './config-profile.constants';

/**
 * Select profile based on memory size (GB)
 */
export function selectConfigProfile(memoryGB: number): ConfigProfile {
  if (memoryGB < 4) {
    return LOW;
  }
  if (memoryGB < 16) {
    return STANDARD;
  }
  return HIGH;
}

/**
 * Get all available profiles
 */
export function getAllConfigProfiles(): ConfigProfile[] {
  return ALL_PROFILES;
}
