/**
 * Migration Error Base Class
 *
 * @remarks
 * Базовый класс для всех ошибок миграций.
 * Следует паттерну Domain Error.
 *
 * @pattern Domain Error
 * @pattern Single Responsibility Principle
 */
import type { MigrationCategory } from '../value-objects';

/**
 * Базовая ошибка миграции
 *
 * @remarks
 * Содержит контекст (category, version) для идентификации проблемы.
 */
export class MigrationError extends Error {
  readonly category: MigrationCategory;
  readonly version: string;
  readonly cause?: Error;

  constructor(
    message: string,
    category: MigrationCategory,
    version: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'MigrationError';
    this.category = category;
    this.version = version;
    this.cause = cause;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MigrationError);
    }
  }

  /**
   * Формирует полное сообщение об ошибке
   */
  getFullMessage(): string {
    const causeMsg = this.cause ? ` | Cause: ${this.cause.message}` : '';
    return `${this.category}/${this.version}: ${this.message}${causeMsg}`;
  }
}
