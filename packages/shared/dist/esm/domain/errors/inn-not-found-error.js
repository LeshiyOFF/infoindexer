"use strict";
/**
 * Ошибка: ИНН не найден
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnNotFoundError = void 0;
const domain_error_1 = require("../domain-error");
class InnNotFoundError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InnNotFoundError';
    }
}
exports.InnNotFoundError = InnNotFoundError;
