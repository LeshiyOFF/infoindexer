"use strict";
/**
 * Handler: Cleanup Stage
 *
 * @remarks
 * Выполняет очистку временных таблиц после синхронизации.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupHandler = void 0;
class CleanupHandler {
    repository;
    stageName = 'cleanup';
    constructor(repository) {
        this.repository = repository;
    }
    async execute(_context) {
        console.log('Cleaning up temporary tables...');
        await this.repository.cleanupRawTables();
    }
}
exports.CleanupHandler = CleanupHandler;
