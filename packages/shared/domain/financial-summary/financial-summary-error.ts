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
export class InvalidMoneyError extends DomainError {
  public readonly context: InvalidMoneyErrorContext;

  constructor(amount: number, currency: string, reason: InvalidMoneyErrorContext['reason']) {
    const messages: Record<InvalidMoneyErrorContext['reason'], string> = {
      negative_amount: `Money amount cannot be negative: ${amount}`,
      invalid_currency: `Invalid currency: ${currency}. Only RUB is supported`,
      missing_field: 'Money amount and currency are required'
    };

    super(messages[reason], { amount, currency, reason });

    this.name = 'InvalidMoneyError';
    this.context = { amount, currency, reason };
  }
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
export class FinancialSummaryNotFoundError extends DomainError {
  public readonly context: FinancialSummaryNotFoundErrorContext;

  constructor(inn: string, source: string = 'financial_reports_summary') {
    super(`Financial summary not found for INN: ${inn}`, { inn, source });

    this.name = 'FinancialSummaryNotFoundError';
    this.context = { inn, source };
  }
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
export class FinancialSummaryValidationError extends DomainError {
  public readonly context: FinancialSummaryValidationErrorContext;

  constructor(field: string, reason: string, value?: unknown) {
    super(`Financial summary validation failed: ${field} - ${reason}`, { field, reason, value });

    this.name = 'FinancialSummaryValidationError';
    this.context = { field, reason, value };
  }

  /**
   * Создаёт ошибку на основе InvalidMoneyError
   */
  static fromMoneyError(error: InvalidMoneyError, field: string): FinancialSummaryValidationError {
    return new FinancialSummaryValidationError(
      field,
      error.context.reason,
      { amount: error.context.amount, currency: error.context.currency }
    );
  }
}
