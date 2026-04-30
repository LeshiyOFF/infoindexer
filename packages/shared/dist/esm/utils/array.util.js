"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtil = void 0;
/**
 * Утилиты для работы с массивами
 */
class ArrayUtil {
    /**
     * Гарантирует, что значение является массивом
     *
     * @param value - Произвольное значение
     * @returns Массив (пустой, если value не массив)
     */
    static ensureArray(value) {
        return Array.isArray(value) ? value : [];
    }
    /**
     * Безопасно получает первый элемент массива
     *
     * @param value - Произвольное значение
     * @returns Первый элемент или null
     */
    static first(value) {
        const arr = this.ensureArray(value);
        return arr.length > 0 ? arr[0] : null;
    }
}
exports.ArrayUtil = ArrayUtil;
