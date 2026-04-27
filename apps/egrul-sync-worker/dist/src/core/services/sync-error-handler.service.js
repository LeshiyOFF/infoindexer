"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncErrorHandler = void 0;
/**
 * Сервис обработки ошибок синхронизации
 */
class SyncErrorHandler {
    progress;
    constructor(progress) {
        this.progress = progress;
    }
    /**
     * Обрабатывает ошибку синхронизации
     */
    async handleError(error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('CRITICAL EGRUL SYNC ERROR:', error);
        await this.progress.report({
            status: 'error',
            error: msg,
            message: `Ошибка: ${msg}`,
            updated_at: new Date().toISOString()
        });
    }
}
exports.SyncErrorHandler = SyncErrorHandler;
