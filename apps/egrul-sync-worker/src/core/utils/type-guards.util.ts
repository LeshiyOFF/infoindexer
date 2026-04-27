/**
 * Type-safe utility функции для работы с неизвестными типами
 *
 * @remarks
 * Предоставляет безопасные методы для работы с данными из внешних источников
 * (ClickHouse, API и т.д.) без использования `as unknown as`.
 */
export class TypeGuardUtil {
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
  static ensureArray(value: unknown): unknown[] {
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
  static first<T>(value: unknown): T | null {
    if (Array.isArray(value) && value.length > 0) {
      return value[0] as T;
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
  static hasKey<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
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
  static extractNumber(obj: unknown, key: string, defaultValue: number = 0): number {
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
  static extractString(obj: unknown, key: string, defaultValue: string = ''): string {
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
  static toInsertRecords<T extends object>(
    values: readonly T[]
  ): Record<string, unknown>[] {
    return values.map(v => ({ ...v })) as Record<string, unknown>[];
  }
}
