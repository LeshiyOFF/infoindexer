/**
 * Утилиты для нормализации и валидации ИНН
 */
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
export declare const normalizeInn: (raw: string | null | undefined) => string;
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
export declare const isValidInn: (inn: string) => boolean;
