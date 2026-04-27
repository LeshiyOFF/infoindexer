/**
 * Rate Limit Result DTO
 *
 * @remarks
 * Domain Layer: Result Type для ответа rate limit проверки.
 * Использует readonly для иммутабельности.
 *
 * Architecture:
 * - Domain Layer: result type
 * - SRP: только хранение результата проверки
 *
 * Iteration 14: Rate Limiting
 */

/**
 * Rate Limit Check Result
 *
 * @remarks
 * Readonly DTO для передачи результата проверки.
 * Используется в Port и API Layer.
 */
export class RateLimitResult {
  private constructor(
    private readonly _allowed: boolean,
    private readonly _limit: number,
    private readonly _remaining: number,
    private readonly _resetAt?: number
  ) {}

  /**
   * Создать результат успешной проверки
   *
   * @param limit - Максимальное количество запросов
   * @param remaining - Оставшиеся запросы
   * @returns RateLimitResult
   */
  static allowed(limit: number, remaining: number): RateLimitResult {
    return new RateLimitResult(true, limit, remaining);
  }

  /**
   * Создать результат превышения лимита
   *
   * @param limit - Максимальное количество запросов
   * @param resetAt - Timestamp сброса лимита
   * @returns RateLimitResult
   */
  static exceeded(limit: number, resetAt: number): RateLimitResult {
    return new RateLimitResult(false, limit, 0, resetAt);
  }

  /**
   * Разрешён ли запрос
   */
  get allowed(): boolean {
    return this._allowed;
  }

  /**
   * Максимальное количество запросов
   */
  get limit(): number {
    return this._limit;
  }

  /**
   * Оставшиеся запросы
   */
  get remaining(): number {
    return this._remaining;
  }

  /**
   * Timestamp сброса лимита (ms)
   */
  get resetAt(): number | undefined {
    return this._resetAt;
  }

  /**
   * Превышен ли лимит
   */
  isExceeded(): boolean {
    return !this._allowed;
  }

  /**
   * Преобразовать в plain object для JSON
   */
  toObject(): Readonly<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt?: number;
  }> {
    const result: {
      allowed: boolean;
      limit: number;
      remaining: number;
      resetAt?: number;
    } = {
      allowed: this._allowed,
      limit: this._limit,
      remaining: this._remaining
    };

    if (this._resetAt !== undefined) {
      result.resetAt = this._resetAt;
    }

    return result;
  }
}
