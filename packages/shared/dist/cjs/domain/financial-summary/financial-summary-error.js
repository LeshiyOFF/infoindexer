"use strict";
/**
 * Financial Summary Domain Errors
 *
 * @remarks
 * Domain Layer: Ошибки валидации для финансовых сводок.
 * Part of Clean Architecture / Hexagonal Ports & Adapters.
 *
 * Architecture:
 * - Domain Layer: ошибки не зависят от Infrastructure
 * - Следуют паттерну существующих DomainError (InvalidInnError, etc.)
 * - Контекст содержит метаданные для debugging
 *
 * Iteration 2: Domain Layer (VOs + DTOs)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialSummaryValidationError = exports.FinancialSummaryNotFoundError = exports.InvalidMoneyError = void 0;
const domain_error_1 = require("../domain-error");
/**
 * Ошибка валидации Money
 */
class InvalidMoneyError extends domain_error_1.DomainError {
    context;
    constructor(amount, currency, reason) {
        const messages = {
            negative_amount: `Money amount cannot be negative: ${amount}`,
            invalid_currency: `Invalid currency: ${currency}. Only RUB is supported`,
            missing_field: 'Money amount and currency are required'
        };
        super(messages[reason], { amount, currency, reason });
        this.name = 'InvalidMoneyError';
        this.context = { amount, currency, reason };
    }
}
exports.InvalidMoneyError = InvalidMoneyError;
/**
 * Ошибка: Financial Summary не найден
 */
class FinancialSummaryNotFoundError extends domain_error_1.DomainError {
    context;
    constructor(inn, source = 'financial_reports_summary') {
        super(`Financial summary not found for INN: ${inn}`, { inn, source });
        this.name = 'FinancialSummaryNotFoundError';
        this.context = { inn, source };
    }
}
exports.FinancialSummaryNotFoundError = FinancialSummaryNotFoundError;
/**
 * Ошибка валидации FinancialSummary
 */
class FinancialSummaryValidationError extends domain_error_1.DomainError {
    context;
    constructor(field, reason, value) {
        super(`Financial summary validation failed: ${field} - ${reason}`, { field, reason, value });
        this.name = 'FinancialSummaryValidationError';
        this.context = { field, reason, value };
    }
    /**
     * Создаёт ошибку на основе InvalidMoneyError
     */
    static fromMoneyError(error, field) {
        return new FinancialSummaryValidationError(field, error.context.reason, { amount: error.context.amount, currency: error.context.currency });
    }
}
exports.FinancialSummaryValidationError = FinancialSummaryValidationError;
