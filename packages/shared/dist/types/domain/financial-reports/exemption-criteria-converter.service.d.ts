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
import { ExemptionCriteria } from './exemption-criteria.enum';
import { ExemptionCriteriaError } from './exemption-criteria-error';
/**
 * Результат конвертации
 */
export interface ExemptionCriteriaConvertResult {
    readonly success: boolean;
    readonly value?: ExemptionCriteria;
    readonly error?: ExemptionCriteriaError;
}
/**
 * Callback для логирования невалидных значений
 */
export type InvalidValueCallback = (invalidValue: string) => void;
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
export declare class ExemptionCriteriaConverter {
    private readonly onInvalidValue?;
    private static readonly DEFAULT_VALUE;
    constructor(onInvalidValue?: InvalidValueCallback | undefined);
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
    convert(value: unknown): ExemptionCriteriaConvertResult;
    /**
     * Конвертирует с выбросом ошибки при невалидном значении
     *
     * @param value - Строковое значение из Parquet
     * @throws ExemptionCriteriaError если значение невалидно
     * @returns Валидное ExemptionCriteria
     */
    convertOrThrow(value: unknown): ExemptionCriteria;
    /**
     * Получает значение по умолчанию
     */
    getDefaultValue(): ExemptionCriteria;
    /**
     * Логирует невалидное значение
     */
    private reportInvalid;
}
/**
 * Singleton instance без логирования
 */
export declare const exemptionCriteriaConverter: ExemptionCriteriaConverter;
