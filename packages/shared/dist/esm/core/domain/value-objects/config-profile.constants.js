/**
 * Predefined Configuration Profiles
 *
 * @remarks
 * Static profile definitions for different memory ranges.
 * Imported by ConfigProfile class for static access.
 */
import { ConfigProfile } from './config-profile.vo';
import { ConfigProfileType } from './config-profile-type.enum';
/**
 * LOW Profile - for systems with less than 4GB RAM
 */
export const LOW = new ConfigProfile({
    type: ConfigProfileType.LOW,
    name: 'Low Memory',
    description: 'For systems with less than 4GB RAM',
    minMemoryGB: 0,
    maxMemoryGB: 4,
    memoryUtilization: 0.5,
    maxExecutionTime: 30,
    maxThreads: 1,
    batchSize: 100000,
    warning: 'Running in low-memory mode. Performance is significantly degraded.'
});
/**
 * STANDARD Profile - for systems with 4-16GB RAM
 */
export const STANDARD = new ConfigProfile({
    type: ConfigProfileType.STANDARD,
    name: 'Standard',
    description: 'For systems with 4-16GB RAM',
    minMemoryGB: 4,
    maxMemoryGB: 16,
    memoryUtilization: 0.6,
    maxExecutionTime: 120,
    maxThreads: 2,
    batchSize: 1000000
});
/**
 * HIGH Profile - for systems with more than 16GB RAM
 */
export const HIGH = new ConfigProfile({
    type: ConfigProfileType.HIGH,
    name: 'High Memory',
    description: 'For systems with more than 16GB RAM',
    minMemoryGB: 16,
    maxMemoryGB: Infinity,
    memoryUtilization: 0.8,
    maxExecutionTime: 180,
    maxThreads: 4,
    batchSize: 5000000
});
/**
 * All available profiles array
 */
export const ALL_PROFILES = [LOW, STANDARD, HIGH];
