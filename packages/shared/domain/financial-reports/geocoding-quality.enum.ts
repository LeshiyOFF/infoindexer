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
export const GEOCODING_QUALITY_VALUES = [
  'unknown',
  'house',
  'street',
  'city',
  'region',
  'postcode',
  'country'
] as const;

/**
 * Geocoding quality type
 */
export type GeocodingQuality = typeof GEOCODING_QUALITY_VALUES[number];

/**
 * Check if value is a valid geocoding quality
 */
export function isValidGeocodingQuality(value: unknown): value is GeocodingQuality {
  if (value === null || value === undefined) return false;
  return GEOCODING_QUALITY_VALUES.includes(value as GeocodingQuality);
}

/**
 * Normalize geocoding quality value
 *
 * @remarks
 * - Returns 'unknown' for invalid values
 * - Returns null for null/undefined
 */
export function normalizeGeocodingQuality(value: unknown): GeocodingQuality | null {
  if (value === null || value === undefined) return null;
  if (isValidGeocodingQuality(value)) return value;

  // Handle common variations
  const str = String(value).toLowerCase().trim();
  if (str === '' || str === 'null') return null;
  if (isValidGeocodingQuality(str)) return str;

  return 'unknown';
}
