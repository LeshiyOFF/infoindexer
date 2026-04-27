/**
 * Adapter: ProgressReporter → IProgressReporterPort
 *
 * @remarks
 * Адаптирует класс ProgressReporter к порту для использования в зависимостях.
 * Следует Adapter pattern: преобразует один интерфейс в другой.
 */
import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';
import type { ProgressReporter } from '../progress-reporter';
export declare class ProgressReporterAdapter implements IProgressReporterPort {
    private readonly reporter;
    constructor(reporter: ProgressReporter);
    report(state: {
        status: string;
        percentage?: number;
        message?: string;
        error?: string;
        updated_at?: string;
        completed_at?: string;
        rows_processed?: number;
    }): Promise<void>;
    createState(status: string, percentage?: number, message?: string, rowsProcessed?: number): {
        status: string;
        percentage?: number;
        message?: string;
        rows_processed?: number;
        updated_at: string;
    };
}
