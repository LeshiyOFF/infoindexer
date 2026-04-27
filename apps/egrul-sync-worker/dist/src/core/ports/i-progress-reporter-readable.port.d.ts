/**
 * Port: ProgressReporter (read-only для зависимостей)
 *
 * @remarks
 * Содержит только публичные методы ProgressReporter для использования в зависимостях.
 * Позволяет избежать проблем с приватными полями при тестировании.
 */
export interface IProgressReporterPort {
    /**
     * Отправляет состояние прогресса
     */
    report(state: {
        status: string;
        percentage?: number;
        message?: string;
        error?: string;
        updated_at?: string;
        completed_at?: string;
        rows_processed?: number;
    }): Promise<void>;
    /**
     * Создаёт состояние прогресса
     */
    createState(status: string, percentage?: number, message?: string, rowsProcessed?: number): {
        status: string;
        percentage?: number;
        message?: string;
        rows_processed?: number;
        updated_at: string;
    };
}
