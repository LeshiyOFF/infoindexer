/**
 * API Response Types
 *
 * Type-safe API responses с discriminated unions.
 * Используется для всех API endpoints.
 */
/**
 * Type-safe API response с discriminated union
 *
 * @example
 * ```ts
 * function getSanctions(inn: string): Promise<ApiResponse<SanctionDTO[]>> {
 *   return { success: true, data: [...] };
 * }
 *
 * function handleError(): Promise<ApiResponse<never>> {
 *   return {
 *     success: false,
 *     error: { code: 'NOT_FOUND', message: 'Sanctions not found' }
 *   };
 * }
 * ```
 */
export type ApiResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: ApiError;
};
/**
 * Стандартизированная ошибка API
 */
export interface ApiError {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
    readonly timestamp?: string;
}
/**
 * Создаёт успешный ответ
 */
export declare function apiSuccess<T>(data: T): ApiResponse<T>;
/**
 * Создаёт ошибочный ответ
 */
export declare function apiError(code: string, message: string, details?: unknown): ApiResponse<never>;
/**
 * Коды ошибок API
 */
export declare enum ApiErrorCode {
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_INN = "INVALID_INN",
    INN_NOT_FOUND = "INN_NOT_FOUND",
    INVALID_COUNTRY_CODE = "INVALID_COUNTRY_CODE",
    INVALID_URL = "INVALID_URL",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    DATABASE_ERROR = "DATABASE_ERROR",
    GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT",
    SYNC_ALREADY_RUNNING = "SYNC_ALREADY_RUNNING",
    SYNC_START_FAILED = "SYNC_START_FAILED",
    SYNC_TIMEOUT = "SYNC_TIMEOUT"
}
/**
 * Пагинация для API responses
 */
export interface Pagination {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
}
/**
 * Ответ с пагинацией
 */
export type PaginatedResponse<T> = ApiResponse<{
    readonly items: readonly T[];
    readonly pagination: Pagination;
}>;
/**
 * Создаёт успешный ответ с пагинацией
 */
export declare function apiPaginated<T>(items: readonly T[], pagination: Pagination): PaginatedResponse<T>;
