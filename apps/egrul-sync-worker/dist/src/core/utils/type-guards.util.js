"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeGuardUtil = void 0;
/**
 * Type-safe utility функции для работы с неизвестными типами
 *
 * @remarks
 * Предоставляет безопасные методы для работы с данными из внешних источников
 * (ClickHouse, API и т.д.) без использования `as unknown as`.
 */
class TypeGuardUtil {
    /**
     * Гарантирует, что значение является массивом
     *
     * @param value - Произвольное значение для проверки
     * @returns Массив (пустой, если значение не массив)
     *
     * @example
     * ```ts
     * const json = await result.json(); // unknown
     * const data = TypeGuardUtil.ensureArray(json); // unknown[]
     * ```
     */
    static ensureArray(value) {
        if (Array.isArray(value)) {
            return value;
        }
        return [];
    }
    /**
     * Безопасно извлекает первый элемент массива
     *
     * @param value - Произвольное значение для проверки
     * @returns Первый элемент массива или null
     *
     * @example
     * ```ts
     * const rows = TypeGuardUtil.ensureArray(json);
     * const first = TypeGuardUtil.first<ClickHouseRow>(rows);
     * ```
     */
    static first(value) {
        if (Array.isArray(value) && value.length > 0) {
            return value[0];
        }
        return null;
    }
    /**
     * Type guard для проверки наличия свойства в объекте
     *
     * @param obj - Произвольный объект
     * @param key - Имя свойства для проверки
     * @returns true если свойство существует в объекте
     */
    static hasKey(obj, key) {
        return typeof obj === 'object' && obj !== null && key in obj;
    }
    /**
     * Безопасно извлекает числовое значение из объекта
     *
     * @param obj - Произвольный объект
     * @param key - Имя свойства для извлечения
     * @param defaultValue - Значение по умолчанию
     * @returns Числовое значение или defaultValue
     */
    static extractNumber(obj, key, defaultValue = 0) {
        if (this.hasKey(obj, key)) {
            const value = obj[key];
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'string') {
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? defaultValue : parsed;
            }
        }
        return defaultValue;
    }
    /**
     * Безопасно извлекает строковое значение из объекта
     *
     * @param obj - Произвольный объект
     * @param key - Имя свойства для извлечения
     * @param defaultValue - Значение по умолчанию
     * @returns Строковое значение или defaultValue
     */
    static extractString(obj, key, defaultValue = '') {
        if (this.hasKey(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                return value;
            }
        }
        return defaultValue;
    }
    /**
     * Type-safe преобразование типизированного массива в формат для ClickHouse insert
     *
     * @remarks
     * Создаёт новый массив где каждый объект превращён в Record<string, unknown>.
     * Это необходимо для ClickHouse client API который требует именно такой тип.
     * Безопасно потому что мы делаем shallow copy с явным приведением типа.
     *
     * @param values - Типизированный массив значений
     * @returns Массив compatible с ClickHouse insert API
     *
     * @example
     * ```ts
     * const rows: EgrulCompanyRow[] = [...];
     * const insertValues = TypeGuardUtil.toInsertRecords(rows);
     * await client.insert({ values: insertValues });
     * ```
     */
    static toInsertRecords(values) {
        return values.map(v => ({ ...v }));
    }
}
exports.TypeGuardUtil = TypeGuardUtil;
