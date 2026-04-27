"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PROFILES = exports.HIGH = exports.STANDARD = exports.LOW = void 0;
/**
 * Predefined Configuration Profiles
 *
 * @remarks
 * Static profile definitions for different memory ranges.
 * Imported by ConfigProfile class for static access.
 */
const config_profile_vo_1 = require("./config-profile.vo");
const config_profile_type_enum_1 = require("./config-profile-type.enum");
/**
 * LOW Profile - for systems with less than 4GB RAM
 */
exports.LOW = new config_profile_vo_1.ConfigProfile({
    type: config_profile_type_enum_1.ConfigProfileType.LOW,
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
exports.STANDARD = new config_profile_vo_1.ConfigProfile({
    type: config_profile_type_enum_1.ConfigProfileType.STANDARD,
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
exports.HIGH = new config_profile_vo_1.ConfigProfile({
    type: config_profile_type_enum_1.ConfigProfileType.HIGH,
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
exports.ALL_PROFILES = [exports.LOW, exports.STANDARD, exports.HIGH];
