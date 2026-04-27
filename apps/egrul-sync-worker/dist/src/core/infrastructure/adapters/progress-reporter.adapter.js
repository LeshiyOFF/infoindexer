"use strict";
/**
 * Adapter: ProgressReporter → IProgressReporterPort
 *
 * @remarks
 * Адаптирует класс ProgressReporter к порту для использования в зависимостях.
 * Следует Adapter pattern: преобразует один интерфейс в другой.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReporterAdapter = void 0;
class ProgressReporterAdapter {
    reporter;
    constructor(reporter) {
        this.reporter = reporter;
    }
    async report(state) {
        await this.reporter.report(state);
    }
    createState(status, percentage, message, rowsProcessed) {
        const state = this.reporter.createState(status, percentage, message, rowsProcessed);
        return {
            ...state,
            updated_at: state.updated_at ?? new Date().toISOString()
        };
    }
}
exports.ProgressReporterAdapter = ProgressReporterAdapter;
