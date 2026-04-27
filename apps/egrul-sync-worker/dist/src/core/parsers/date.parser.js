"use strict";
/**
 * Парсер дат для EGRUL данных
 * Обеспечивает безопасный парсинг с fallback значениями
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.parseNullableDate = parseNullableDate;
/**
 * Парсит дату из строки. Возвращает сегодняшнюю дату если парсинг неудачен.
 *
 * @param dateStr - Строка с датой в формате ISO или похожем
 * @returns Дата в формате YYYY-MM-DD
 */
function parseDate(dateStr) {
    if (!dateStr) {
        return getTodayDate();
    }
    try {
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
            return getTodayDate();
        }
        return parsed.toISOString().split('T')[0];
    }
    catch {
        return getTodayDate();
    }
}
/**
 * Парсит nullable дату. Возвращает null если дата пустая или неверная.
 *
 * @param dateStr - Строка с датой или undefined
 * @returns Дата в формате YYYY-MM-DD или null
 */
function parseNullableDate(dateStr) {
    if (!dateStr) {
        return null;
    }
    try {
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
            return null;
        }
        return parsed.toISOString().split('T')[0];
    }
    catch {
        return null;
    }
}
/**
 * Возвращает сегодняшнюю дату в формате YYYY-MM-DD
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
