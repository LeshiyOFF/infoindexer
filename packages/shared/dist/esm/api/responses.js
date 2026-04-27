/**
 * API Response Types
 *
 * Type-safe API responses с discriminated unions.
 * Используется для всех API endpoints.
 */
/**
 * Создаёт успешный ответ
 */
export function apiSuccess(data) {
    return { success: true, data };
}
/**
 * Создаёт ошибочный ответ
 */
export function apiError(code, message, details) {
    return {
        success: false,
        error: { code, message, details, timestamp: new Date().toISOString() }
    };
}
/**
 * Коды ошибок API
 */
export var ApiErrorCode;
(function (ApiErrorCode) {
    // Общие ошибки (4xx)
    ApiErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["CONFLICT"] = "CONFLICT";
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    // Ошибки домена (4xx)
    ApiErrorCode["INVALID_INN"] = "INVALID_INN";
    ApiErrorCode["INN_NOT_FOUND"] = "INN_NOT_FOUND";
    ApiErrorCode["INVALID_COUNTRY_CODE"] = "INVALID_COUNTRY_CODE";
    ApiErrorCode["INVALID_URL"] = "INVALID_URL";
    // Ошибки сервера (5xx)
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ApiErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ApiErrorCode["GATEWAY_TIMEOUT"] = "GATEWAY_TIMEOUT";
    // Ошибки синхронизации
    ApiErrorCode["SYNC_ALREADY_RUNNING"] = "SYNC_ALREADY_RUNNING";
    ApiErrorCode["SYNC_START_FAILED"] = "SYNC_START_FAILED";
    ApiErrorCode["SYNC_TIMEOUT"] = "SYNC_TIMEOUT";
})(ApiErrorCode || (ApiErrorCode = {}));
/**
 * Создаёт успешный ответ с пагинацией
 */
export function apiPaginated(items, pagination) {
    return apiSuccess({ items, pagination });
}
