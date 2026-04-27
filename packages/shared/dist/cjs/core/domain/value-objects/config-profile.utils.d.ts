/**
 * Config Profile Utilities
 *
 * @remarks
 * Factory functions for ConfigProfile.
 * Separated from class to avoid circular dependency.
 */
import { ConfigProfile } from './config-profile.vo';
/**
 * Select profile based on memory size (GB)
 */
export declare function selectConfigProfile(memoryGB: number): ConfigProfile;
/**
 * Get all available profiles
 */
export declare function getAllConfigProfiles(): ConfigProfile[];
