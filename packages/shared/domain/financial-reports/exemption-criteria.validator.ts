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

import { ExemptionCriteria, ALL_EXEMPTION_CRITERIA, isValidExemptionCriteria } from './exemption-criteria.enum';
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
export class ExemptionCriteriaValidator {
  private static readonly VALID_VALUES: readonly string[] = ALL_EXEMPTION_CRITERIA;

  /**
   * Валидирует exemption_criteria
   *
   * @param value - Строковое значение для проверки
   * @returns ValidationResult с isValid флагом
   */
  validate(value: string): ExemptionCriteriaValidationResult {
    if (!value || typeof value !== 'string') {
      return {
        isValid: false,
        error: new ExemptionCriteriaError(
          String(value ?? 'null'),
          ExemptionCriteriaValidator.VALID_VALUES
        )
      };
    }

    const trimmed = value.trim();

    if (!isValidExemptionCriteria(trimmed)) {
      return {
        isValid: false,
        error: new ExemptionCriteriaError(
          trimmed,
          ExemptionCriteriaValidator.VALID_VALUES
        )
      };
    }

    return {
      isValid: true,
      value: trimmed as ExemptionCriteria
    };
  }

  /**
   * Валидирует и выбрасывает ошибку если невалидно
   *
   * @param value - Строковое значение для проверки
   * @throws ExemptionCriteriaError если валидация не прошла
   * @returns Валидное значение ExemptionCriteria
   */
  validateOrThrow(value: string): ExemptionCriteria {
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
  getValidValues(): readonly string[] {
    return ExemptionCriteriaValidator.VALID_VALUES;
  }
}

/**
 * Singleton instance для удобства импорта
 */
export const exemptionCriteriaValidator = new ExemptionCriteriaValidator();
