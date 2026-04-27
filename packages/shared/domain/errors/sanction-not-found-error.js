"use strict";
/**
 * Ошибка: санкция не найдена
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionNotFoundError = void 0;
const domain_error_1 = require("../domain-error");
class SanctionNotFoundError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'SanctionNotFoundError';
    }
}
exports.SanctionNotFoundError = SanctionNotFoundError;
