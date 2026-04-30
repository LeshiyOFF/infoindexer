"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationError = void 0;
/**
 * Базовая ошибка миграции
 *
 * @remarks
 * Содержит контекст (category, version) для идентификации проблемы.
 */
class MigrationError extends Error {
    category;
    version;
    cause;
    constructor(message, category, version, cause) {
        super(message);
        this.name = 'MigrationError';
        this.category = category;
        this.version = version;
        this.cause = cause;
        // Maintains proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MigrationError);
        }
    }
    /**
     * Формирует полное сообщение об ошибке
     */
    getFullMessage() {
        const causeMsg = this.cause ? ` | Cause: ${this.cause.message}` : '';
        return `${this.category}/${this.version}: ${this.message}${causeMsg}`;
    }
}
exports.MigrationError = MigrationError;
