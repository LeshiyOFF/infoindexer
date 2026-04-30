/**
 * Exemption Criteria Validation Error
 *
 * @remarks
 * Domain Layer: Ошибка валидации exemption_criteria.
 * Part of ExemptionCriteria type safety enforcement.
 *
 * Architecture:
 * - Domain Layer: custom error
 * - Follows project error pattern (InnInvalidError, etc.)
 * - SRP: только ошибка валидации exemption_criteria
 */
import { DomainError } from '../domain-error';
/**
 * Ошибка валидации exemption_criteria
 *
 * @remarks
 * Выбрасывается когда значение не соответствует одному из
 * валидных значений ExemptionCriteria enum.
 *
 * @example
 * ```ts
 * throw new ExemptionCriteriaError('unknown_value', ALL_EXEMPTION_CRITERIA);
 * // Error: Invalid exemption_criteria value: 'unknown_value'. Valid values: none, initiated, state, financial, religious
 * ```
 */
export class ExemptionCriteriaError extends DomainError {
    context;
    constructor(invalidValue, validValues) {
        const validList = validValues.join(', ');
        super(`Invalid exemption_criteria value: '${invalidValue}'. Valid values: ${validList}`, { invalidValue, validValues });
        this.name = 'ExemptionCriteriaError';
        this.context = { invalidValue, validValues };
    }
}
