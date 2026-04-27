"use strict";
/**
 * Domain Error Base Class
 *
 * Базовый класс для всех domain ошибок.
 * Все ошибки содержат контекст для debugging.
 *
 * @example
 * ```ts
 * throw new InvalidCountryCodeError('Invalid code', { code: 'XX', normalized: 'xx' });
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
/**
 * Базовый класс для всех domain ошибок
 */
class DomainError extends Error {
    context;
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
    /**
     * Форматирует ошибку для логирования
     */
    toLog() {
        return `${this.name}: ${this.message} | Context: ${JSON.stringify(this.context)}`;
    }
}
exports.DomainError = DomainError;
