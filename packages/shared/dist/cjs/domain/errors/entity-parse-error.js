"use strict";
/**
 * Ошибка парсинга FTM entity
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityParseError = void 0;
const domain_error_1 = require("../domain-error");
class EntityParseError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'EntityParseError';
    }
}
exports.EntityParseError = EntityParseError;
