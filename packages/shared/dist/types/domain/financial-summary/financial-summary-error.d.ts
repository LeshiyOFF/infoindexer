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
import { DomainError } from '../domain-error';
/**
 * Контекст ошибки валидации Money
 */
export interface InvalidMoneyErrorContext {
    /** Невалидное значение amount */
    readonly amount: number;
    /** Невалидное значение currency */
    readonly currency: string;
    /** Причина ошибки */
    readonly reason: 'negative_amount' | 'invalid_currency' | 'missing_field';
    /** Индексная сигнатура для совместимости с DomainError.context */
    readonly [key: string]: string | number;
}
/**
 * Ошибка валидации Money
 */
export declare class InvalidMoneyError extends DomainError {
    readonly context: InvalidMoneyErrorContext;
    constructor(amount: number, currency: string, reason: InvalidMoneyErrorContext['reason']);
}
/**
 * Контекст ошибки "Financial Summary не найден"
 */
export interface FinancialSummaryNotFoundErrorContext {
    /** ИНН организации */
    readonly inn: string;
    /** Источник, где производился поиск */
    readonly source: string;
    /** Индексная сигнатура для совместимости с DomainError.context */
    readonly [key: string]: string;
}
/**
 * Ошибка: Financial Summary не найден
 */
export declare class FinancialSummaryNotFoundError extends DomainError {
    readonly context: FinancialSummaryNotFoundErrorContext;
    constructor(inn: string, source?: string);
}
/**
 * Контекст ошибки валидации FinancialSummary
 */
export interface FinancialSummaryValidationErrorContext {
    /** ИНН организации */
    readonly inn?: string;
    /** Поле с ошибкой */
    readonly field: string;
    /** Причина ошибки */
    readonly reason: string;
    /** Исходное значение */
    readonly value?: unknown;
    /** Индексная сигнатура для совместимости с DomainError.context */
    readonly [key: string]: string | unknown;
}
/**
 * Ошибка валидации FinancialSummary
 */
export declare class FinancialSummaryValidationError extends DomainError {
    readonly context: FinancialSummaryValidationErrorContext;
    constructor(field: string, reason: string, value?: unknown);
    /**
     * Создаёт ошибку на основе InvalidMoneyError
     */
    static fromMoneyError(error: InvalidMoneyError, field: string): FinancialSummaryValidationError;
}
