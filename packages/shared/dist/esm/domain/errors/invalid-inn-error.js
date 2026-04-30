"use strict";
/**
 * Ошибка валидации ИНН
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidInnError = void 0;
const domain_error_1 = require("../domain-error");
class InvalidInnError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidInnError';
    }
}
exports.InvalidInnError = InvalidInnError;
