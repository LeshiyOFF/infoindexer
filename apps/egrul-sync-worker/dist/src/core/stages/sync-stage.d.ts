/**
 * Base Sync Stage
 *
 * Базовый класс для всех stage синхронизации.
 */
import type { StageContext, StageResult, StageOptions, StageMetadata } from './stage-context';
/**
 * Базовый абстрактный класс для stage синхронизации
 */
export declare abstract class BaseSyncStage {
    protected readonly context: StageContext;
    private readonly reporter;
    constructor(context: StageContext);
    /**
     * Выполняет stage с обработкой ошибок и progress reporting
     */
    execute(options?: StageOptions): Promise<StageResult>;
    /**
     * Основная логика stage (должна быть переопределена)
     */
    protected abstract runInternal(options: StageOptions): Promise<StageResult>;
    /**
     * Возвращает метаданные stage
     */
    protected abstract getMetadata(): StageMetadata;
    /**
     * Выполняет HTTP запрос с circuit breaker и retry
     */
    protected executeWithResilience<T>(fn: () => Promise<T>, operation: string): Promise<T>;
    /**
     * Проверяет, является ли ошибка повторяемой
     */
    protected isRetryable(error: unknown): boolean;
    /**
     * Корректирует процент выполнения в диапазоне stage
     */
    private adjustProgress;
}
