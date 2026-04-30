/**
 * Sync Stage Reporter
 *
 * Выделенные методы отчета о прогрессе для соблюдения size limits.
 */
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { StageResult, StageMetadata } from './stage-context';
/**
 * Отвечает за отчет о прогрессе stage
 */
export declare class SyncStageReporter {
    private readonly reporter;
    private lastReportTime;
    private readonly REPORT_THROTTLE;
    constructor(reporter: ProgressReporter);
    /**
     * Отчёт о начале stage
     */
    reportStart(metadata: StageMetadata): Promise<void>;
    /**
     * Отчёт о завершении stage
     */
    reportComplete(metadata: StageMetadata, result: StageResult): Promise<void>;
    /**
     * Отчёт об ошибке
     */
    reportError(metadata: StageMetadata, error: string, code: string): Promise<void>;
    /**
     * Отчёт о прогрессе с throttling
     */
    throttledReport(metadata: StageMetadata, progress: number, message: string): void;
}
