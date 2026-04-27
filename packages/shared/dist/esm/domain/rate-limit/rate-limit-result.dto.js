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
    _allowed;
    _limit;
    _remaining;
    _resetAt;
    constructor(_allowed, _limit, _remaining, _resetAt) {
        this._allowed = _allowed;
        this._limit = _limit;
        this._remaining = _remaining;
        this._resetAt = _resetAt;
    }
    /**
     * Создать результат успешной проверки
     *
     * @param limit - Максимальное количество запросов
     * @param remaining - Оставшиеся запросы
     * @returns RateLimitResult
     */
    static allowed(limit, remaining) {
        return new RateLimitResult(true, limit, remaining);
    }
    /**
     * Создать результат превышения лимита
     *
     * @param limit - Максимальное количество запросов
     * @param resetAt - Timestamp сброса лимита
     * @returns RateLimitResult
     */
    static exceeded(limit, resetAt) {
        return new RateLimitResult(false, limit, 0, resetAt);
    }
    /**
     * Разрешён ли запрос
     */
    get allowed() {
        return this._allowed;
    }
    /**
     * Максимальное количество запросов
     */
    get limit() {
        return this._limit;
    }
    /**
     * Оставшиеся запросы
     */
    get remaining() {
        return this._remaining;
    }
    /**
     * Timestamp сброса лимита (ms)
     */
    get resetAt() {
        return this._resetAt;
    }
    /**
     * Превышен ли лимит
     */
    isExceeded() {
        return !this._allowed;
    }
    /**
     * Преобразовать в plain object для JSON
     */
    toObject() {
        const result = {
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
