"use strict";
/**
 * Ошибка валидации санкционной программы
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidSanctionProgramError = void 0;
const domain_error_1 = require("../domain-error");
class InvalidSanctionProgramError extends domain_error_1.DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidSanctionProgramError';
    }
}
exports.InvalidSanctionProgramError = InvalidSanctionProgramError;
