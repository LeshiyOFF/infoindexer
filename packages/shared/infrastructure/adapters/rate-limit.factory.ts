/**
 * Rate Limit Factory
 *
 * @remarks
 * Infrastructure Layer: Factory для создания rate limit сервиса.
 * Часть Hexagonal/Ports & Adapters архитектуры.
 *
 * Architecture:
 * - Factory Pattern: создаёт configured инстанс
 * - DIP: возвращает Port, а не конкретный Adapter
 * - SRP: только создание инстанса
 *
 * Iteration 14: Rate Limiting
 */

import Redis from 'ioredis';
import { RedisRateLimitAdapter } from './redis-rate-limit.adapter';
import type { IRateLimitPort } from '../ports/i-rate-limit.port';
import { redisClient } from '../../redis';

/**
 * Опции для создания rate limit сервиса
 *
 * @remarks
 * Опциональные параметры для конфигурации.
 */
export interface RateLimitFactoryOptions {
  /**
   * Custom Redis клиент
   *
   * @default redisClient из shared/redis
   */
  readonly redis?: Redis;
}

/**
 * Создать rate limit сервис
 *
 * @param options - Опции
 * @returns IRateLimitPort
 *
 * @remarks
 * Фабричный метод для создания rate limit сервиса.
 * Возвращает Port для DIP compliance.
 *
 * @example
 * ```ts
 * const rateLimiter = createRateLimitService();
 * const result = await rateLimiter.check('127.0.0.1', 'search');
 * ```
 */
export function createRateLimitService(
  options?: RateLimitFactoryOptions
): IRateLimitPort {
  const redis = options?.redis ?? redisClient;
  return new RedisRateLimitAdapter(redis);
}

/**
 * Создать rate limit сервис с custom Redis
 *
 * @param redis - Redis клиент
 * @returns IRateLimitPort
 *
 * @remarks
 * Перегрузка для удобства с explicit Redis клиентом.
 */
export function createRateLimitServiceWithRedis(redis: Redis): IRateLimitPort {
  return new RedisRateLimitAdapter(redis);
}
