/**
 * Уровень риска санкционной метки
 *
 * Используется для классификации степени риска
 * связанной с конкретным topic или их комбинацией
 */
export var SanctionLevel;
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
})(SanctionLevel || (SanctionLevel = {}));
/**
 * Все уровни риска
 */
export const ALL_SANCTION_LEVELS = Object.values(SanctionLevel);
/**
 * Числовое значение уровня риска для сортировки
 * Чем выше значение — тем выше риск
 */
export const SANCTION_LEVEL_WEIGHT = {
    [SanctionLevel.NONE]: 0,
    [SanctionLevel.LOW]: 1,
    [SanctionLevel.MEDIUM]: 2,
    [SanctionLevel.HIGH]: 3,
};
/**
 * Сравнивает два уровня риска
 * @returns положительное число если a > b, отрицательное если a < b, 0 если равны
 */
export function compareSanctionLevels(a, b) {
    return SANCTION_LEVEL_WEIGHT[a] - SANCTION_LEVEL_WEIGHT[b];
}
/**
 * Возвращает максимальный уровень риска из двух
 */
export function maxSanctionLevel(a, b) {
    return compareSanctionLevels(a, b) >= 0 ? a : b;
}
