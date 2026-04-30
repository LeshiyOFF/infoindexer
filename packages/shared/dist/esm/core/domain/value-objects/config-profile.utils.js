"use strict";
/**
 * Config Profile Utilities
 *
 * @remarks
 * Factory functions for ConfigProfile.
 * Separated from class to avoid circular dependency.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectConfigProfile = selectConfigProfile;
exports.getAllConfigProfiles = getAllConfigProfiles;
const config_profile_constants_1 = require("./config-profile.constants");
/**
 * Select profile based on memory size (GB)
 */
function selectConfigProfile(memoryGB) {
    if (memoryGB < 4) {
        return config_profile_constants_1.LOW;
    }
    if (memoryGB < 16) {
        return config_profile_constants_1.STANDARD;
    }
    return config_profile_constants_1.HIGH;
}
/**
 * Get all available profiles
 */
function getAllConfigProfiles() {
    return config_profile_constants_1.ALL_PROFILES;
}
