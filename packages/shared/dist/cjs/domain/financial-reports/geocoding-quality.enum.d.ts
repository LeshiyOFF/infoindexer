/**
 * Geocoding Quality Enum
 *
 * @remarks
 * Represents the accuracy level of geocoding (address → coordinates).
 * Based on Nominatim/OpenStreetMap standard categories.
 *
 * Source: RFSD Parquet files (VARCHAR field)
 */
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
export declare const GEOCODING_QUALITY_VALUES: readonly ["unknown", "house", "street", "city", "region", "postcode", "country"];
/**
 * Geocoding quality type
 */
export type GeocodingQuality = typeof GEOCODING_QUALITY_VALUES[number];
/**
 * Check if value is a valid geocoding quality
 */
export declare function isValidGeocodingQuality(value: unknown): value is GeocodingQuality;
/**
 * Normalize geocoding quality value
 *
 * @remarks
 * - Returns 'unknown' for invalid values
 * - Returns null for null/undefined
 */
export declare function normalizeGeocodingQuality(value: unknown): GeocodingQuality | null;
