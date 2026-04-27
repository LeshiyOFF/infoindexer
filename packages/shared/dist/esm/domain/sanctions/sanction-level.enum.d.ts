/**
 * Уровень риска санкционной метки
 *
 * Используется для классификации степени риска
 * связанной с конкретным topic или их комбинацией
 */
export declare enum SanctionLevel {
    /**
     * Высокий риск
     * Прямые санкции, серьёзные преступления, терроризм
     */
    HIGH = "high",
    /**
     * Средний риск
     * PEP, связи с санкционными лицами, коррупция
     */
    MEDIUM = "medium",
    /**
     * Низкий риск
     * Государственные служащие, посредники
     */
    LOW = "low",
    /**
     * Риск не определён
     * Нет санкционных меток
     */
    NONE = "none"
}
/**
 * Все уровни риска
 */
export declare const ALL_SANCTION_LEVELS: readonly SanctionLevel[];
/**
 * Числовое значение уровня риска для сортировки
 * Чем выше значение — тем выше риск
 */
export declare const SANCTION_LEVEL_WEIGHT: Readonly<Record<SanctionLevel, number>>;
/**
 * Сравнивает два уровня риска
 * @returns положительное число если a > b, отрицательное если a < b, 0 если равны
 */
export declare function compareSanctionLevels(a: SanctionLevel, b: SanctionLevel): number;
/**
 * Возвращает максимальный уровень риска из двух
 */
export declare function maxSanctionLevel(a: SanctionLevel, b: SanctionLevel): SanctionLevel;
