"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitService = createRateLimitService;
exports.createRateLimitServiceWithRedis = createRateLimitServiceWithRedis;
const redis_rate_limit_adapter_1 = require("./redis-rate-limit.adapter");
const redis_1 = require("../../redis");
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
function createRateLimitService(options) {
    const redis = options?.redis ?? redis_1.redisClient;
    return new redis_rate_limit_adapter_1.RedisRateLimitAdapter(redis);
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
function createRateLimitServiceWithRedis(redis) {
    return new redis_rate_limit_adapter_1.RedisRateLimitAdapter(redis);
}
