/**
 * Value Object для результата отмены
 *
 * @remarks
 * Имутабельный объект результата операции отмены.
 */
/**
 * Статус выполнения отмены
 */
export type AbortStatus = 'success' | 'failed' | 'not_found';
/**
 * Результат операции отмены
 */
export interface AbortResult {
    readonly status: AbortStatus;
    readonly operationId: string;
    readonly message?: string;
    readonly error?: string;
    readonly rowsDeleted?: number;
}
/**
 * Создаёт успешный результат отмены
 */
export declare function abortSuccess(operationId: string, rowsDeleted?: number): AbortResult;
/**
 * Создаёт результат "операция не найдена"
 */
export declare function abortNotFound(operationId: string): AbortResult;
/**
 * Создаёт результат с ошибкой
 */
export declare function abortFailed(operationId: string, error: string): AbortResult;
/**
 * Проверяет, успешна ли отмена
 */
export declare function isAbortSuccess(result: AbortResult): boolean;
/**
 * Проверяет, что операция не найдена
 */
export declare function isAbortNotFound(result: AbortResult): boolean;
