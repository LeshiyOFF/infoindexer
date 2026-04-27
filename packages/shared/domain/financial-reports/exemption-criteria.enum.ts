/**
 * Exemption Criteria Enum
 *
 * @remarks
 * Domain Layer: Типобезопасный enum для exemption_criteria.
 * Часть architectural решения для хранения в ClickHouse Enum8.
 *
 * Источник данных: RFSD Parquet (https://huggingface.co/datasets/irlspbru/RFSD)
 * Распределение значений (2024):
 * - none: 3,145,286 (99.4%)
 * - initiated: 17,258
 * - state: 7,484
 * - financial: 488
 * - religious: 44
 *
 * Architecture:
 * - Domain Layer: enum definition
 * - String values для соответствия ClickHouse Enum8
 * - Readonly для иммутабельности
 *
 * @see https://clickhouse.com/docs/en/sql-reference/data-types/enum
 */

/**
 * Exemption Criteria
 *
 * @remarks
 * Критерий освобождения от обязательной сдачи финансовой отчётности.
 * Значения соответствуют классификации ФНС России.
 */
export enum ExemptionCriteria {
  /**
   * Не освобождён
   * Обязательная сдача всей отчётности
   */
  NONE = 'none',

  /**
   * Иницирована процедура банкротства
   */
  INITIATED = 'initiated',

  /**
   * Государственная/муниципальная организация
   */
  STATE = 'state',

  /**
   * Финансовая организация
   */
  FINANCIAL = 'financial',

  /**
   * Религиозная организация
   */
  RELIGIOUS = 'religious'
}

/**
 * Все возможные значения ExemptionCriteria
 *
 * @remarks
 * Используется для валидации и итерации.
 * Readonly для иммутабельности.
 */
export const ALL_EXEMPTION_CRITERIA: readonly ExemptionCriteria[] = Object.values(
  ExemptionCriteria
) as readonly ExemptionCriteria[];

/**
 * Проверяет является ли строка валидным ExemptionCriteria
 *
 * @param value - Значение для проверки
 * @returns true если значение валидно
 *
 * @example
 * ```ts
 * isValidExemptionCriteria('none') // true
 * isValidExemptionCriteria('unknown') // false
 * ```
 */
export function isValidExemptionCriteria(value: string): value is ExemptionCriteria {
  return ALL_EXEMPTION_CRITERIA.includes(value as ExemptionCriteria);
}
