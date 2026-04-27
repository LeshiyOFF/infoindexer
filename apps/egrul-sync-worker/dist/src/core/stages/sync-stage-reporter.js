"use strict";
/**
 * Sync Stage Reporter
 *
 * Выделенные методы отчета о прогрессе для соблюдения size limits.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStageReporter = void 0;
const shared_1 = require("shared");
const stage_context_1 = require("./stage-context");
/**
 * Отвечает за отчет о прогрессе stage
 */
class SyncStageReporter {
    reporter;
    lastReportTime = 0;
    REPORT_THROTTLE = 500;
    constructor(reporter) {
        this.reporter = reporter;
    }
    /**
     * Отчёт о начале stage
     */
    async reportStart(metadata) {
        const state = (0, shared_1.createSyncStatus)('running', metadata.stage, `Начало: ${metadata.name}`, undefined // percentage - indeterminate режим
        );
        await this.reporter.report(state);
    }
    /**
     * Отчёт о завершении stage
     */
    async reportComplete(metadata, result) {
        const message = (0, stage_context_1.isStageSuccess)(result)
            ? `${metadata.name} завершено: ${result.processed} записей`
            : `${metadata.name}: ${result.error}`;
        const state = (0, shared_1.createSyncStatus)('running', metadata.stage, message, undefined // percentage - indeterminate режим
        );
        await this.reporter.report(state);
    }
    /**
     * Отчёт об ошибке
     */
    async reportError(metadata, error, code) {
        const state = (0, shared_1.createSyncStatus)('error', metadata.stage, `Ошибка: ${error}`, undefined, // percentage
        undefined, // startedAt
        code // error
        );
        await this.reporter.report(state);
    }
    /**
     * Отчёт о прогрессе с throttling
     */
    throttledReport(metadata, progress, message) {
        const now = Date.now();
        if (now - this.lastReportTime < this.REPORT_THROTTLE) {
            return;
        }
        this.lastReportTime = now;
        const state = (0, shared_1.createSyncStatus)('running', metadata.stage, message, undefined // percentage - indeterminate режим
        );
        void this.reporter.report(state);
    }
}
exports.SyncStageReporter = SyncStageReporter;
