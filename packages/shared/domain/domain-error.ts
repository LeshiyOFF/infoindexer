/**
 * Domain Error Base Class
 *
 * Базовый класс для всех domain ошибок.
 * Все ошибки содержат контекст для debugging.
 *
 * @example
 * ```ts
 * throw new InvalidCountryCodeError('Invalid code', { code: 'XX', normalized: 'xx' });
 * ```
 */

/**
 * Базовый класс для всех domain ошибок
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly context: Readonly<Record<string, unknown>>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Форматирует ошибку для логирования
   */
  toLog(): string {
    return `${this.name}: ${this.message} | Context: ${JSON.stringify(this.context)}`;
  }
}
