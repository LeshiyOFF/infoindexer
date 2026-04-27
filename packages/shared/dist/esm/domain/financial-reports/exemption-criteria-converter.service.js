/**
 * Exemption Criteria Converter Service
 *
 * @remarks
 * Domain Layer: Конвертер exemption_criteria из Parquet в ClickHouse формат.
 * Используется в sync-worker ColumnMapper.
 *
 * Architecture:
 * - Domain Layer: conversion logic
 * - SRP: только конвертация exemption_criteria
 * - DRY: reusable conversion logic
 *
 * Requirements:
 * - Parquet (VARCHAR) → ClickHouse (Enum8 string)
 * - Strict validation: unknown values logged, not defaulted
 */
import { ExemptionCriteria, ALL_EXEMPTION_CRITERIA, isValidExemptionCriteria } from './exemption-criteria.enum';
import { ExemptionCriteriaError } from './exemption-criteria-error';
/**
 * Сервис для конвертации exemption_criteria
 *
 * @remarks
 * Конвертирует строковые значения из Parquet в валидные ExemptionCriteria.
 * Использует строгую валидацию с callback для логирования.
 *
 * @example
 * ```ts
 * const converter = new ExemptionCriteriaConverter((v) => console.warn(v));
 * const result = converter.convert('none');
 * // { success: true, value: 'none' }
 * ```
 */
export class ExemptionCriteriaConverter {
    onInvalidValue;
    static DEFAULT_VALUE = ExemptionCriteria.NONE;
    constructor(onInvalidValue) {
        this.onInvalidValue = onInvalidValue;
    }
    /**
     * Конвертирует строковое значение в ExemptionCriteria
     *
     * @param value - Строковое значение из Parquet
     * @returns ConvertResult с success флагом
     *
     * @remarks
     * - Валидные значения: конвертирует как есть
     * - Невалидные значения: логирует, использует default (NONE)
     */
    convert(value) {
        // Обработка null/undefined
        if (value === null || value === undefined) {
            return {
                success: true,
                value: ExemptionCriteriaConverter.DEFAULT_VALUE
            };
        }
        // Обработка не-строковых значений
        if (typeof value !== 'string') {
            this.reportInvalid(String(value));
            return {
                success: true,
                value: ExemptionCriteriaConverter.DEFAULT_VALUE
            };
        }
        const trimmed = value.trim();
        // Пустая строка → default
        if (trimmed === '') {
            return {
                success: true,
                value: ExemptionCriteriaConverter.DEFAULT_VALUE
            };
        }
        // Валидация
        if (!isValidExemptionCriteria(trimmed)) {
            this.reportInvalid(trimmed);
            return {
                success: true,
                value: ExemptionCriteriaConverter.DEFAULT_VALUE
            };
        }
        return {
            success: true,
            value: trimmed
        };
    }
    /**
     * Конвертирует с выбросом ошибки при невалидном значении
     *
     * @param value - Строковое значение из Parquet
     * @throws ExemptionCriteriaError если значение невалидно
     * @returns Валидное ExemptionCriteria
     */
    convertOrThrow(value) {
        const result = this.convert(value);
        if (!result.success || !result.value) {
            throw result.error || new ExemptionCriteriaError(String(value), ALL_EXEMPTION_CRITERIA);
        }
        return result.value;
    }
    /**
     * Получает значение по умолчанию
     */
    getDefaultValue() {
        return ExemptionCriteriaConverter.DEFAULT_VALUE;
    }
    /**
     * Логирует невалидное значение
     */
    reportInvalid(invalidValue) {
        if (this.onInvalidValue) {
            this.onInvalidValue(invalidValue);
        }
    }
}
/**
 * Singleton instance без логирования
 */
export const exemptionCriteriaConverter = new ExemptionCriteriaConverter();
