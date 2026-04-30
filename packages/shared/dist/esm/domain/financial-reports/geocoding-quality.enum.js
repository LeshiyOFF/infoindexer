"use strict";
/**
 * Geocoding Quality Enum
 *
 * @remarks
 * Represents the accuracy level of geocoding (address → coordinates).
 * Based on Nominatim/OpenStreetMap standard categories.
 *
 * Source: RFSD Parquet files (VARCHAR field)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOCODING_QUALITY_VALUES = void 0;
exports.isValidGeocodingQuality = isValidGeocodingQuality;
exports.normalizeGeocodingQuality = normalizeGeocodingQuality;
/**
 * Valid geocoding quality values
 *
 * @remarks
 * - unknown: Unknown or not geocoded
 * - house: Exact address match (house number level)
 * - street: Street level match
 * - city: City level match
 * - region: Region/state level match
 * - postcode: Postal code level match
 * - country: Country level match
 */
exports.GEOCODING_QUALITY_VALUES = [
    'unknown',
    'house',
    'street',
    'city',
    'region',
    'postcode',
    'country'
];
/**
 * Check if value is a valid geocoding quality
 */
function isValidGeocodingQuality(value) {
    if (value === null || value === undefined)
        return false;
    return exports.GEOCODING_QUALITY_VALUES.includes(value);
}
/**
 * Normalize geocoding quality value
 *
 * @remarks
 * - Returns 'unknown' for invalid values
 * - Returns null for null/undefined
 */
function normalizeGeocodingQuality(value) {
    if (value === null || value === undefined)
        return null;
    if (isValidGeocodingQuality(value))
        return value;
    // Handle common variations
    const str = String(value).toLowerCase().trim();
    if (str === '' || str === 'null')
        return null;
    if (isValidGeocodingQuality(str))
        return str;
    return 'unknown';
}
