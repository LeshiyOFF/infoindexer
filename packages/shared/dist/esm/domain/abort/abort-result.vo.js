"use strict";
/**
 * Value Object для результата отмены
 *
 * @remarks
 * Имутабельный объект результата операции отмены.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.abortSuccess = abortSuccess;
exports.abortNotFound = abortNotFound;
exports.abortFailed = abortFailed;
exports.isAbortSuccess = isAbortSuccess;
exports.isAbortNotFound = isAbortNotFound;
/**
 * Создаёт успешный результат отмены
 */
function abortSuccess(operationId, rowsDeleted) {
    return {
        status: 'success',
        operationId,
        message: rowsDeleted !== undefined
            ? `Операция отменена. Удалено записей: ${rowsDeleted}`
            : 'Операция отменена',
        rowsDeleted
    };
}
/**
 * Создаёт результат "операция не найдена"
 */
function abortNotFound(operationId) {
    return {
        status: 'not_found',
        operationId,
        message: 'Операция не найдена'
    };
}
/**
 * Создаёт результат с ошибкой
 */
function abortFailed(operationId, error) {
    return {
        status: 'failed',
        operationId,
        error
    };
}
/**
 * Проверяет, успешна ли отмена
 */
function isAbortSuccess(result) {
    return result.status === 'success';
}
/**
 * Проверяет, что операция не найдена
 */
function isAbortNotFound(result) {
    return result.status === 'not_found';
}
