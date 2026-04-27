"use strict";
/**
 * Ошибка валидации кода страны
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCountryCodeError = void 0;
const domain_error_1 = require("../domain-error");
class InvalidCountryCodeError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidCountryCodeError';
    }
}
exports.InvalidCountryCodeError = InvalidCountryCodeError;
