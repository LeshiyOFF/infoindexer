/**
 * Financial Reports Domain Layer Index
 *
 * @remarks
 * Централизованный экспорт всех exemption_criteria и geocoding_quality компонентов.
 */
export { ExemptionCriteria, ALL_EXEMPTION_CRITERIA, isValidExemptionCriteria } from './exemption-criteria.enum';
export { ExemptionCriteriaError } from './exemption-criteria-error';
export type { ExemptionCriteriaErrorContext } from './exemption-criteria-error';
export { ExemptionCriteriaValidator, exemptionCriteriaValidator } from './exemption-criteria.validator';
export type { ExemptionCriteriaValidationResult } from './exemption-criteria.validator';
export { ExemptionCriteriaConverter, exemptionCriteriaConverter } from './exemption-criteria-converter.service';
export type { ExemptionCriteriaConvertResult, InvalidValueCallback } from './exemption-criteria-converter.service';
export { GEOCODING_QUALITY_VALUES, isValidGeocodingQuality, normalizeGeocodingQuality } from './geocoding-quality.enum';
export type { GeocodingQuality } from './geocoding-quality.enum';
export { GeocodingQualityConverter, geocodingQualityConverter } from './geocoding-quality-converter.service';
export type { GeocodingQualityConversionResult } from './geocoding-quality-converter.service';
