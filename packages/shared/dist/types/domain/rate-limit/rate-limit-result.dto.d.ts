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
export declare class RateLimitResult {
    private readonly _allowed;
    private readonly _limit;
    private readonly _remaining;
    private readonly _resetAt?;
    private constructor();
    /**
     * Создать результат успешной проверки
     *
     * @param limit - Максимальное количество запросов
     * @param remaining - Оставшиеся запросы
     * @returns RateLimitResult
     */
    static allowed(limit: number, remaining: number): RateLimitResult;
    /**
     * Создать результат превышения лимита
     *
     * @param limit - Максимальное количество запросов
     * @param resetAt - Timestamp сброса лимита
     * @returns RateLimitResult
     */
    static exceeded(limit: number, resetAt: number): RateLimitResult;
    /**
     * Разрешён ли запрос
     */
    get allowed(): boolean;
    /**
     * Максимальное количество запросов
     */
    get limit(): number;
    /**
     * Оставшиеся запросы
     */
    get remaining(): number;
    /**
     * Timestamp сброса лимита (ms)
     */
    get resetAt(): number | undefined;
    /**
     * Превышен ли лимит
     */
    isExceeded(): boolean;
    /**
     * Преобразовать в plain object для JSON
     */
    toObject(): Readonly<{
        allowed: boolean;
        limit: number;
        remaining: number;
        resetAt?: number;
    }>;
}
