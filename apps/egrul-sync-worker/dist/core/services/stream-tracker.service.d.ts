import type { ProgressReporter } from '../infrastructure/progress-reporter';
/**
 * Сервис для отслеживания прогресса чтения потока
 */
export declare class StreamTracker {
    private readonly progress;
    constructor(progress: ProgressReporter);
    /**
     * Обрабатывает прогресс для заданной строки
     */
    handleLine(lineNumber: number): Promise<void>;
}
