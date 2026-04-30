/**
 * Value Object для результата отмены
 *
 * @remarks
 * Имутабельный объект результата операции отмены.
 */
/**
 * Создаёт успешный результат отмены
 */
export function abortSuccess(operationId, rowsDeleted) {
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
export function abortNotFound(operationId) {
    return {
        status: 'not_found',
        operationId,
        message: 'Операция не найдена'
    };
}
/**
 * Создаёт результат с ошибкой
 */
export function abortFailed(operationId, error) {
    return {
        status: 'failed',
        operationId,
        error
    };
}
/**
 * Проверяет, успешна ли отмена
 */
export function isAbortSuccess(result) {
    return result.status === 'success';
}
/**
 * Проверяет, что операция не найдена
 */
export function isAbortNotFound(result) {
    return result.status === 'not_found';
}
