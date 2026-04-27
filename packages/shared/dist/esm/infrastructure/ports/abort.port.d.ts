/**
 * Порт для обработки отмены операций
 *
 * @remarks
 * Интерфейс для отмены асинхронных операций.
 * Следует ISP: только метод abort.
 */
/**
 * Результат выполнения операции отмены
 */
export interface AbortResult {
    readonly success: boolean;
    readonly message?: string;
    readonly error?: string;
}
/**
 * Порт для обработки отмены операций
 */
export interface IAbortHandler {
    /**
     * Отменяет операцию по идентификатору
     *
     * @param operationId - Идентификатор операции (год, тип и т.д.)
     * @returns Результат отмены
     */
    abort(operationId: string): Promise<AbortResult>;
}
/**
 * Тип операции для отмены
 */
export type AbortOperationType = 'financial-sync' | 'egrul-sync' | 'sanctions-sync' | 'summary-refresh';
/**
 * Контекст команды отмены
 */
export interface AbortContext {
    readonly operationId: string;
    readonly operationType: AbortOperationType;
    readonly userId?: string;
    readonly timestamp: number;
}
