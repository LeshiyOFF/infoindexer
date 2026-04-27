/**
 * Config Profile Utilities
 *
 * @remarks
 * Factory functions for ConfigProfile.
 * Separated from class to avoid circular dependency.
 */
import { LOW, STANDARD, HIGH, ALL_PROFILES } from './config-profile.constants';
/**
 * Select profile based on memory size (GB)
 */
export function selectConfigProfile(memoryGB) {
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
export function getAllConfigProfiles() {
    return ALL_PROFILES;
}
