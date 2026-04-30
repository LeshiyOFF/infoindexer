/**
 * Type-safe utility функции для работы с неизвестными типами
 *
 * @remarks
 * Предоставляет безопасные методы для работы с данными из внешних источников
 * (ClickHouse, API и т.д.) без использования `as unknown as`.
 */
export declare class TypeGuardUtil {
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
    static ensureArray(value: unknown): unknown[];
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
    static first<T>(value: unknown): T | null;
    /**
     * Type guard для проверки наличия свойства в объекте
     *
     * @param obj - Произвольный объект
     * @param key - Имя свойства для проверки
     * @returns true если свойство существует в объекте
     */
    static hasKey<K extends string>(obj: unknown, key: K): obj is Record<K, unknown>;
    /**
     * Безопасно извлекает числовое значение из объекта
     *
     * @param obj - Произвольный объект
     * @param key - Имя свойства для извлечения
     * @param defaultValue - Значение по умолчанию
     * @returns Числовое значение или defaultValue
     */
    static extractNumber(obj: unknown, key: string, defaultValue?: number): number;
    /**
     * Безопасно извлекает строковое значение из объекта
     *
     * @param obj - Произвольный объект
     * @param key - Имя свойства для извлечения
     * @param defaultValue - Значение по умолчанию
     * @returns Строковое значение или defaultValue
     */
    static extractString(obj: unknown, key: string, defaultValue?: string): string;
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
    static toInsertRecords<T extends object>(values: readonly T[]): Record<string, unknown>[];
}
