/**
 * Rate Limit Port
 *
 * @remarks
 * Infrastructure Layer: Port interface для rate limiting.
 * Часть Hexagonal/Ports & Adapters архитектуры.
 *
 * Architecture:
 * - Port (Infrastructure Layer): Этот interface
 * - Adapter (Infrastructure Layer): RedisRateLimitAdapter
 * - API Layer зависит от этого Port (DIP)
 *
 * Design Decision: Minimal interface
 * - Два метода: check() для проверки, isHealthy() для health check
 * - Async: поддерживает remote storage (Redis)
 * - Error handling: throws для системных ошибок
 *
 * Implementations:
 * - RedisRateLimitAdapter: Redis с INCR/EXPIRE (Iteration 14)
 *
 * Iteration 14: Rate Limiting
 */

import type { RateLimitType } from '../../domain/rate-limit';
import type { RateLimitResult } from '../../domain/rate-limit';

/**
 * Rate Limit Check Options
 *
 * @remarks
 * Опциональные параметры для проверки.
 */
export interface RateLimitCheckOptions {
  /**
   * Пропустить проверку (для testing/admin)
   *
   * @default false
   */
  readonly bypass?: boolean;
}

/**
 * Rate Limit Port Interface
 *
 * @remarks
 * Абстракция для rate limiting реализации.
 * High-level модули зависят от этой абстракции (DIP).
 *
 * Гарантии:
 * - Thread-safe (Redis atomic operations)
 * - Race condition free (INCR + EXPIRE)
 * - Idempotent (множественные вызовы безопасны)
 *
 * @example
 * ```ts
 * const result = await rateLimitPort.check('127.0.0.1', 'search');
 * if (!result.allowed) {
 *   return Response.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export interface IRateLimitPort {
  /**
   * Проверить rate limit для идентификатора
   *
   * @param identifier - Уникальный идентификатор (IP, userId)
   * @param type - Тип лимита
   * @param options - Опциональные параметры
   * @returns Result с флагом allowed и метаданными
   *
   * @throws {Error} Для системных ошибок (Redis недоступен)
   *
   * @remarks
   * - Atomic: INCR + EXPIRE
   * - Sliding window: фиксированное окно
   * - Returns remaining даже при exceeded
   *
   * Redis Key Format:
   * ratelimit:{type}:{identifier}
   *
   * Error Handling:
   * - Redis connection error: throw Error
   * - Invalid params: throw Error
   */
  check(
    identifier: string,
    type: RateLimitType,
    options?: RateLimitCheckOptions
  ): Promise<RateLimitResult>;

  /**
   * Проверить здоровье сервиса
   *
   * @returns true если Redis доступен
   *
   * @remarks
   * Используется для health checks и circuit breakers.
   * Должен возвращать false если Redis недоступен.
   */
  isHealthy(): boolean;
}
