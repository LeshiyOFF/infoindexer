"use strict";
/**
 * Утилиты для нормализации и валидации ИНН
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidInn = exports.normalizeInn = void 0;
/**
 * Нормализует ИНН: удаляет пробелы и приводит к верхнему регистру
 *
 * @param raw - Сырой ИНН из источника данных
 * @returns Нормализованный ИНН или пустая строка если null/undefined
 *
 * @example
 * ```ts
 * normalizeInn(" 1234567890 ") // "1234567890"
 * normalizeInn(null) // ""
 * ```
 */
const normalizeInn = (raw) => {
    if (raw === null || raw === undefined) {
        return '';
    }
    return raw.trim().toUpperCase();
};
exports.normalizeInn = normalizeInn;
/**
 * Проверяет валидность ИНН
 *
 * @param inn - ИНН для проверки
 * @returns true если ИНН валиден
 *
 * @remarks
 * Правила валидации:
 * - ИНН организации: 10 цифр
 * - ИНН ИП: 12 цифр
 *
 * @example
 * ```ts
 * isValidInn("1234567890") // true (10 цифр - организация)
 * isValidInn("123456789012") // true (12 цифр - ИП)
 * isValidInn("12345") // false
 * isValidInn("") // false
 * ```
 */
const isValidInn = (inn) => {
    const normalized = (0, exports.normalizeInn)(inn);
    // ИНН организации: 10 цифр, ИП: 12 цифр
    const innRegex = /^\d{10}(\d{2})?$/;
    return innRegex.test(normalized);
};
exports.isValidInn = isValidInn;
