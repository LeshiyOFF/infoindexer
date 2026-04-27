/**
 * Утилиты для работы с массивами
 */
export declare class ArrayUtil {
    /**
     * Гарантирует, что значение является массивом
     *
     * @param value - Произвольное значение
     * @returns Массив (пустой, если value не массив)
     */
    static ensureArray(value: unknown): unknown[];
    /**
     * Безопасно получает первый элемент массива
     *
     * @param value - Произвольное значение
     * @returns Первый элемент или null
     */
    static first<T>(value: unknown): T | null;
}
