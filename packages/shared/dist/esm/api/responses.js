"use strict";
/**
 * API Response Types
 *
 * Type-safe API responses с discriminated unions.
 * Используется для всех API endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorCode = void 0;
exports.apiSuccess = apiSuccess;
exports.apiError = apiError;
exports.apiPaginated = apiPaginated;
/**
 * Создаёт успешный ответ
 */
function apiSuccess(data) {
    return { success: true, data };
}
/**
 * Создаёт ошибочный ответ
 */
function apiError(code, message, details) {
    return {
        success: false,
        error: { code, message, details, timestamp: new Date().toISOString() }
    };
}
/**
 * Коды ошибок API
 */
var ApiErrorCode;
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
})(ApiErrorCode || (exports.ApiErrorCode = ApiErrorCode = {}));
/**
 * Создаёт успешный ответ с пагинацией
 */
function apiPaginated(items, pagination) {
    return apiSuccess({ items, pagination });
}
