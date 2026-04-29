/**
 * Rate Limit Types
 *
 * @remarks
 * API Layer: Типы для rate limiting middleware.
 *
 * Architecture:
 * - API Layer: type definitions
 * - SRP: только типы для rate limiting
 *
 * Iteration 14: Rate Limiting
 */

import type { RateLimitResult } from 'shared/client';

/**
 * HTTP Response Headers для Rate Limit
 *
 * @remarks
 * Стандартные headers для rate limit response.
 */
export interface RateLimitHeaders {
  /** Оставшиеся запросы */
  'X-RateLimit-Remaining': string;
  /** Лимит запросов */
  'X-RateLimit-Limit': string;
  /** Timestamp сброса (опционально) */
  'X-RateLimit-Reset'?: string;
  /** Retry-After в секундах (опционально) */
  'Retry-After'?: string;
}

/**
 * Rate Limit Wrapper Result
 *
 * @remarks
 * Результат проверки с headers для response.
 */
export interface RateLimitWrapperResult {
  /** Разрешён ли запрос */
  readonly allowed: boolean;
  /** HTTP status code */
  readonly status: number;
  /** Response headers */
  readonly headers: RateLimitHeaders;
  /** Полный результат */
  readonly result: RateLimitResult;
}
