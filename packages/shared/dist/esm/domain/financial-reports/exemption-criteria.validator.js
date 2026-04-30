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
import { ALL_EXEMPTION_CRITERIA, isValidExemptionCriteria } from './exemption-criteria.enum';
import { ExemptionCriteriaError } from './exemption-criteria-error';
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
export class ExemptionCriteriaValidator {
    static VALID_VALUES = ALL_EXEMPTION_CRITERIA;
    /**
     * Валидирует exemption_criteria
     *
     * @param value - Строковое значение для проверки
     * @returns ValidationResult с isValid флагом
     */
    validate(value) {
        if (!value || typeof value !== 'string') {
            return {
                isValid: false,
                error: new ExemptionCriteriaError(String(value ?? 'null'), ExemptionCriteriaValidator.VALID_VALUES)
            };
        }
        const trimmed = value.trim();
        if (!isValidExemptionCriteria(trimmed)) {
            return {
                isValid: false,
                error: new ExemptionCriteriaError(trimmed, ExemptionCriteriaValidator.VALID_VALUES)
            };
        }
        return {
            isValid: true,
            value: trimmed
        };
    }
    /**
     * Валидирует и выбрасывает ошибку если невалидно
     *
     * @param value - Строковое значение для проверки
     * @throws ExemptionCriteriaError если валидация не прошла
     * @returns Валидное значение ExemptionCriteria
     */
    validateOrThrow(value) {
        const result = this.validate(value);
        if (!result.isValid || !result.value) {
            throw result.error;
        }
        return result.value;
    }
    /**
     * Получает все валидные значения
     *
     * @returns Readonly массив всех валидных значений
     */
    getValidValues() {
        return ExemptionCriteriaValidator.VALID_VALUES;
    }
}
/**
 * Singleton instance для удобства импорта
 */
export const exemptionCriteriaValidator = new ExemptionCriteriaValidator();
