/**
 * Predefined Configuration Profiles
 *
 * @remarks
 * Static profile definitions for different memory ranges.
 * Imported by ConfigProfile class for static access.
 */
import { ConfigProfile } from './config-profile.vo';
/**
 * LOW Profile - for systems with less than 4GB RAM
 */
export declare const LOW: ConfigProfile;
/**
 * STANDARD Profile - for systems with 4-16GB RAM
 */
export declare const STANDARD: ConfigProfile;
/**
 * HIGH Profile - for systems with more than 16GB RAM
 */
export declare const HIGH: ConfigProfile;
/**
 * All available profiles array
 */
export declare const ALL_PROFILES: ConfigProfile[];
