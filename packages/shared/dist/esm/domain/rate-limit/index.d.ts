/**
 * Rate Limit Domain Layer
 *
 * @remarks
 * Domain Layer: Экспорт всех rate limit компонентов.
 *
 * Iteration 14: Rate Limiting
 */
export type { RateLimitType } from './rate-limit-type.type';
export type { LimitConfig } from './rate-limit-config.vo';
export { RateLimitConfig, RATE_LIMITS } from './rate-limit-config.vo';
export { RateLimitResult } from './rate-limit-result.dto';
