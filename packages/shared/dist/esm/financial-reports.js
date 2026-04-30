"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreationDate = getCreationDate;
exports.getDissolutionDate = getDissolutionDate;
exports.getOkved = getOkved;
exports.getStringField = getStringField;
exports.getNumberField = getNumberField;
/**
 * Типобезопасные утилиты для работы с FinancialReport
 *
 * FinancialReport использует индексную сигнатуру для динамических полей из Parquet.
 * Эти функции обеспечивают типобезопасный доступ к известным полям.
 */
/**
 * Извлекает дату регистрации из отчёта
 * @returns строка даты или undefined
 */
function getCreationDate(report) {
    const value = report.creation_date;
    if (value === undefined || value === null)
        return undefined;
    return String(value);
}
/**
 * Извлекает дату ликвидации из отчёта
 */
function getDissolutionDate(report) {
    const value = report.dissolution_date;
    if (value === undefined || value === null)
        return undefined;
    return String(value);
}
/**
 * Извлекает OKVED из отчёта
 */
function getOkved(report) {
    const value = report.okved;
    if (value === undefined || value === null)
        return undefined;
    return String(value);
}
/**
 * Типизированное получение строкового поля
 */
function getStringField(report, key) {
    const value = report[key];
    if (value === undefined || value === null || value === 0)
        return undefined;
    return String(value);
}
/**
 * Типизированное получение числового поля
 */
function getNumberField(report, key) {
    const value = report[key];
    if (value === undefined || value === null)
        return undefined;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? undefined : num;
}
