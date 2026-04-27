/**
 * Sanction Parse Error
 *
 * Ошибка парсинга данных санкций.
 */

import { ParseError } from './parse-error';

/**
 * Типы ошибок парсинга санкций
 */
export enum SanctionParseErrorCode {
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_INN_FORMAT = 'INVALID_INN_FORMAT',
  INVALID_URL_FORMAT = 'INVALID_URL_FORMAT',
  EMPTY_PROGRAM = 'EMPTY_PROGRAM',
  EMPTY_AUTHORITY = 'EMPTY_AUTHORITY'
}

/**
 * Контекст ошибки парсинга
 */
export interface SanctionParseErrorContext {
  readonly fieldName?: string;
  readonly fieldValue?: string;
  readonly raw?: unknown;
}

/**
 * Ошибка парсинга санкций
 */
export class SanctionParseError extends ParseError {
  readonly code: SanctionParseErrorCode;
  readonly context?: SanctionParseErrorContext;

  constructor(
    message: string,
    code: SanctionParseErrorCode,
    context?: SanctionParseErrorContext
  ) {
    super(message, 'SANCTION_PARSE_ERROR');
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, SanctionParseError.prototype);
  }

  /**
   * Создаёт ошибку отсутствия обязательного поля
   */
  static missingField(fieldName: string, raw?: unknown): SanctionParseError {
    return new SanctionParseError(
      `Missing required field: ${fieldName}`,
      SanctionParseErrorCode.MISSING_REQUIRED_FIELD,
      { fieldName, raw: JSON.stringify(raw) }
    );
  }

  /**
   * Создаёт ошибку неверного формата даты
   */
  static invalidDate(fieldName: string, value: string): SanctionParseError {
    return new SanctionParseError(
      `Invalid date format for ${fieldName}: ${value}`,
      SanctionParseErrorCode.INVALID_DATE_FORMAT,
      { fieldName, fieldValue: value }
    );
  }

  /**
   * Создаёт ошибку неверного формата ИНН
   */
  static invalidInn(value: string): SanctionParseError {
    return new SanctionParseError(
      `Invalid INN format: ${value}`,
      SanctionParseErrorCode.INVALID_INN_FORMAT,
      { fieldValue: value }
    );
  }

  /**
   * Создаёт ошибку неверного формата URL
   */
  static invalidUrl(fieldName: string, value: string): SanctionParseError {
    return new SanctionParseError(
      `Invalid URL format for ${fieldName}: ${value}`,
      SanctionParseErrorCode.INVALID_URL_FORMAT,
      { fieldName, fieldValue: value }
    );
  }

  /**
   * Создаёт ошибку пустой программы
   */
  static emptyProgram(): SanctionParseError {
    return new SanctionParseError(
      'Sanction program cannot be empty',
      SanctionParseErrorCode.EMPTY_PROGRAM
    );
  }

  /**
   * Создаёт ошибку пустого органа
   */
  static emptyAuthority(): SanctionParseError {
    return new SanctionParseError(
      'Sanction authority cannot be empty',
      SanctionParseErrorCode.EMPTY_AUTHORITY
    );
  }
}
