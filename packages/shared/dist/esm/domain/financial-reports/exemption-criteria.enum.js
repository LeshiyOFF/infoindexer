"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_EXEMPTION_CRITERIA = exports.ExemptionCriteria = void 0;
exports.isValidExemptionCriteria = isValidExemptionCriteria;
/**
 * Exemption Criteria
 *
 * @remarks
 * Критерий освобождения от обязательной сдачи финансовой отчётности.
 * Значения соответствуют классификации ФНС России.
 */
var ExemptionCriteria;
(function (ExemptionCriteria) {
    /**
     * Не освобождён
     * Обязательная сдача всей отчётности
     */
    ExemptionCriteria["NONE"] = "none";
    /**
     * Иницирована процедура банкротства
     */
    ExemptionCriteria["INITIATED"] = "initiated";
    /**
     * Государственная/муниципальная организация
     */
    ExemptionCriteria["STATE"] = "state";
    /**
     * Финансовая организация
     */
    ExemptionCriteria["FINANCIAL"] = "financial";
    /**
     * Религиозная организация
     */
    ExemptionCriteria["RELIGIOUS"] = "religious";
})(ExemptionCriteria || (exports.ExemptionCriteria = ExemptionCriteria = {}));
/**
 * Все возможные значения ExemptionCriteria
 *
 * @remarks
 * Используется для валидации и итерации.
 * Readonly для иммутабельности.
 */
exports.ALL_EXEMPTION_CRITERIA = Object.values(ExemptionCriteria);
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
function isValidExemptionCriteria(value) {
    return exports.ALL_EXEMPTION_CRITERIA.includes(value);
}
