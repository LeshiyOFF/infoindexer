"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SANCTION_LEVEL_WEIGHT = exports.ALL_SANCTION_LEVELS = exports.SanctionLevel = void 0;
exports.compareSanctionLevels = compareSanctionLevels;
exports.maxSanctionLevel = maxSanctionLevel;
/**
 * Уровень риска санкционной метки
 *
 * Используется для классификации степени риска
 * связанной с конкретным topic или их комбинацией
 */
var SanctionLevel;
(function (SanctionLevel) {
    /**
     * Высокий риск
     * Прямые санкции, серьёзные преступления, терроризм
     */
    SanctionLevel["HIGH"] = "high";
    /**
     * Средний риск
     * PEP, связи с санкционными лицами, коррупция
     */
    SanctionLevel["MEDIUM"] = "medium";
    /**
     * Низкий риск
     * Государственные служащие, посредники
     */
    SanctionLevel["LOW"] = "low";
    /**
     * Риск не определён
     * Нет санкционных меток
     */
    SanctionLevel["NONE"] = "none";
})(SanctionLevel || (exports.SanctionLevel = SanctionLevel = {}));
/**
 * Все уровни риска
 */
exports.ALL_SANCTION_LEVELS = Object.values(SanctionLevel);
/**
 * Числовое значение уровня риска для сортировки
 * Чем выше значение — тем выше риск
 */
exports.SANCTION_LEVEL_WEIGHT = {
    [SanctionLevel.NONE]: 0,
    [SanctionLevel.LOW]: 1,
    [SanctionLevel.MEDIUM]: 2,
    [SanctionLevel.HIGH]: 3,
};
/**
 * Сравнивает два уровня риска
 * @returns положительное число если a > b, отрицательное если a < b, 0 если равны
 */
function compareSanctionLevels(a, b) {
    return exports.SANCTION_LEVEL_WEIGHT[a] - exports.SANCTION_LEVEL_WEIGHT[b];
}
/**
 * Возвращает максимальный уровень риска из двух
 */
function maxSanctionLevel(a, b) {
    return compareSanctionLevels(a, b) >= 0 ? a : b;
}
