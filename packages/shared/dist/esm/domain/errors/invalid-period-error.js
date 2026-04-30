"use strict";
/**
 * Ошибка валидации периода санкции
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPeriodError = void 0;
const domain_error_1 = require("../domain-error");
class InvalidPeriodError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidPeriodError';
    }
}
exports.InvalidPeriodError = InvalidPeriodError;
