/**
 * Утилиты для работы с массивами
 */
export class ArrayUtil {
  /**
   * Гарантирует, что значение является массивом
   *
   * @param value - Произвольное значение
   * @returns Массив (пустой, если value не массив)
   */
  static ensureArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  /**
   * Безопасно получает первый элемент массива
   *
   * @param value - Произвольное значение
   * @returns Первый элемент или null
   */
  static first<T>(value: unknown): T | null {
    const arr = this.ensureArray(value);
    return arr.length > 0 ? (arr[0] as T) : null;
  }
}
