import type { ProgressReporter } from '../infrastructure/progress-reporter';
/**
 * Сервис обработки ошибок синхронизации
 */
export declare class SyncErrorHandler {
    private readonly progress;
    constructor(progress: ProgressReporter);
    /**
     * Обрабатывает ошибку синхронизации
     */
    handleError(error: unknown): Promise<void>;
}
