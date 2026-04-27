"use strict";
/**
 * Доменные типы для sync-worker
 *
 * @remarks
 * Содержит типы для синхронизации financial reports.
 * Не зависит от конкретных реализаций инфраструктуры.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncAbortedError = void 0;
/**
 * Ошибка прерывания синхронизации
 */
class SyncAbortedError extends Error {
    constructor() {
        super('Sync aborted by user');
        this.name = 'SyncAbortedError';
    }
}
exports.SyncAbortedError = SyncAbortedError;
