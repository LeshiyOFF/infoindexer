"use strict";
/**
 * Ошибка валидации URL
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUrlError = void 0;
const domain_error_1 = require("../domain-error");
class InvalidUrlError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidUrlError';
    }
}
exports.InvalidUrlError = InvalidUrlError;
