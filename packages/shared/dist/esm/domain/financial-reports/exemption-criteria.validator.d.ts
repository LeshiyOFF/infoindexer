/**
 * Exemption Criteria Validator
 *
 * @remarks
 * Domain Layer: Валидатор exemption_criteria.
 * Следует паттерну InnValidator из shared/domain/gdpr/.
 *
 * Architecture:
 * - Domain Layer: pure validation logic
 * - SRP: только валидация exemption_criteria
 * - DRY: reusable across sync-worker, admin-ui
 *
 * Requirements:
 * - ФЗ-152: корректная классификация exemption_criteria
 * - ClickHouse Enum8: только валидные значения
 */
import { ExemptionCriteria } from './exemption-criteria.enum';
import { ExemptionCriteriaError } from './exemption-criteria-error';
/**
 * Результат валидации
 */
export interface ExemptionCriteriaValidationResult {
    readonly isValid: boolean;
    readonly value?: ExemptionCriteria;
    readonly error?: ExemptionCriteriaError;
}
/**
 * Validator для exemption_criteria
 *
 * @remarks
 * Валидирует exemption_criteria согласно RFSD классификации.
 * Использует строгую валидацию (no fallback).
 *
 * @example
 * ```ts
 * const validator = new ExemptionCriteriaValidator();
 * const result = validator.validate('none');
 * // { isValid: true, value: 'none' }
 *
 * const invalid = validator.validate('unknown');
 * // { isValid: false, error: ExemptionCriteriaError }
 * ```
 */
export declare class ExemptionCriteriaValidator {
    private static readonly VALID_VALUES;
    /**
     * Валидирует exemption_criteria
     *
     * @param value - Строковое значение для проверки
     * @returns ValidationResult с isValid флагом
     */
    validate(value: string): ExemptionCriteriaValidationResult;
    /**
     * Валидирует и выбрасывает ошибку если невалидно
     *
     * @param value - Строковое значение для проверки
     * @throws ExemptionCriteriaError если валидация не прошла
     * @returns Валидное значение ExemptionCriteria
     */
    validateOrThrow(value: string): ExemptionCriteria;
    /**
     * Получает все валидные значения
     *
     * @returns Readonly массив всех валидных значений
     */
    getValidValues(): readonly string[];
}
/**
 * Singleton instance для удобства импорта
 */
export declare const exemptionCriteriaValidator: ExemptionCriteriaValidator;
