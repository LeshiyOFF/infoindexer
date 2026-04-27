"use strict";
/**
 * Ошибка небезопасного URL (не в whitelist)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsafeUrlError = void 0;
const domain_error_1 = require("../domain-error");
class UnsafeUrlError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'UnsafeUrlError';
    }
}
exports.UnsafeUrlError = UnsafeUrlError;
