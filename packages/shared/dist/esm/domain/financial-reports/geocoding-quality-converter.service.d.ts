/**
 * Geocoding Quality Converter Service
 *
 * @remarks
 * Domain Layer: Value Object + Converter for geocoding_quality field.
 * Converts Parquet VARCHAR values to normalized ClickHouse String values.
 *
 * Architecture: Hexagonal / Ports & Adapters
 * - Domain: This file (business logic)
 * - Infrastructure: ClickHouse storage adapter
 *
 * Source data (RFSD Parquet): VARCHAR with values "house", "street", "city", NULL
 * Target data (ClickHouse): LowCardinality(Nullable(String))
 */
import type { GeocodingQuality } from './geocoding-quality.enum';
/**
 * Conversion result
 */
export interface GeocodingQualityConversionResult {
    value: GeocodingQuality | null;
    wasNormalized: boolean;
}
/**
 * Geocoding Quality Converter
 *
 * @remarks
 * Converts raw Parquet values to normalized geocoding quality values.
 * Handles NULL, invalid values, and common variations.
 *
 * @example
 * ```ts
 * const result = converter.convert('house');
 * // { value: 'house', wasNormalized: false }
 *
 * const result2 = converter.convert('invalid');
 * // { value: 'unknown', wasNormalized: true }
 *
 * const result3 = converter.convert(null);
 * // { value: null, wasNormalized: false }
 * ```
 */
export declare class GeocodingQualityConverter {
    private readonly stats;
    /**
     * Convert raw value to normalized geocoding quality
     *
     * @param val - Raw value from Parquet (string, number, null, undefined)
     * @returns Normalized value or null
     */
    convert(val: unknown): GeocodingQualityConversionResult;
    /**
     * Get conversion statistics
     */
    getStats(): {
        total: number;
        normalized: number;
        nulls: number;
    };
    /**
     * Reset statistics
     */
    resetStats(): void;
}
/**
 * Singleton instance for application-wide use
 */
export declare const geocodingQualityConverter: GeocodingQualityConverter;
