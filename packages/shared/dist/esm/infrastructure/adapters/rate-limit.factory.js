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
import { RedisRateLimitAdapter } from './redis-rate-limit.adapter';
import { redisClient } from '../../redis';
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
export function createRateLimitService(options) {
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
export function createRateLimitServiceWithRedis(redis) {
    return new RedisRateLimitAdapter(redis);
}
