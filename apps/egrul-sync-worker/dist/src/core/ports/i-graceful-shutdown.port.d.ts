/**
 * Port для управления корректным завершением работы
 *
 * @remarks
 * Определяет контракт для graceful shutdown реализации.
 * Следует Dependency Inversion: высокоуровневые модули зависят от абстракции.
 */
/**
 * Контекст завершения работы
 */
export interface ShutdownContext {
    readonly signal: string;
    readonly timestamp: number;
}
/**
 * Результат завершения работы
 */
export interface ShutdownResult {
    readonly success: boolean;
    readonly elapsedMs: number;
    readonly operationsSaved: number;
    readonly connectionsClosed: boolean;
}
/**
 * Port для управления корректным завершением работы
 */
export interface IGracefulShutdown {
    /**
     * Инициирует graceful shutdown
     *
     * @param context - Контекст завершения
     * @returns Результат завершения
     */
    shutdown(context: ShutdownContext): Promise<ShutdownResult>;
    /**
     * Проверяет, происходит ли завершение
     */
    isShuttingDown(): boolean;
    /**
     * Регистрирует callback для pre-shutdown действий
     *
     * @param name - Уникальное имя операции
     * @param handler - Функция для выполнения перед shutdown
     */
    registerHandler(name: string, handler: () => Promise<void>): void;
}
