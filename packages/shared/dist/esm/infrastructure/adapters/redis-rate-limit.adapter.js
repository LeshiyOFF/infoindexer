"use strict";
/**
 * Redis Rate Limit Adapter
 *
 * @remarks
 * Infrastructure Layer: Redis реализация IRateLimitPort.
 * Часть Hexagonal/Ports & Adapters архитектуры.
 *
 * Architecture:
 * - Port: IRateLimitPort
 * - Adapter: Этот класс
 * - DIP: API зависит от Port, не от этого Adapter
 *
 * Redis Strategy:
 * - INCR: атомарное увеличение счётчика
 * - EXPIRE: установка TTL для первого запроса
 * - TTL: получение времени до сброса
 *
 * Iteration 14: Rate Limiting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisRateLimitAdapter = void 0;
const rate_limit_1 = require("../../domain/rate-limit");
/**
 * Redis Rate Limit Adapter
 *
 * @remarks
 * Реализует rate limiting через Redis INCR/EXPIRE.
 * Race-condition free благодаря атомарным операциям.
 */
class RedisRateLimitAdapter {
    static KEY_PREFIX = 'ratelimit';
    static KEY_SEPARATOR = ':';
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    /**
     * Проверить rate limit
     *
     * @param identifier - Уникальный идентификатор
     * @param type - Тип лимита
     * @param options - Опции
     * @returns RateLimitResult
     *
     * @throws {Error} Если Redis недоступен
     */
    async check(identifier, type, options) {
        // Bypass для testing/admin
        if (options?.bypass) {
            const config = rate_limit_1.RateLimitConfig.get(type);
            return rate_limit_1.RateLimitResult.allowed(config.requests, config.requests);
        }
        const config = rate_limit_1.RateLimitConfig.get(type);
        const key = this.buildKey(type, identifier);
        try {
            // Атомарное увеличение счётчика
            const current = await this.getCurrent(key);
            // Установка TTL для первого запроса
            if (current === 1) {
                await this.setExpiration(key, config.window);
            }
            // Проверка лимита
            if (current > config.requests) {
                const ttl = await this.getTtl(key);
                const resetAt = Date.now() + ttl * 1000;
                return rate_limit_1.RateLimitResult.exceeded(config.requests, resetAt);
            }
            const remaining = config.requests - current;
            return rate_limit_1.RateLimitResult.allowed(config.requests, remaining);
        }
        catch (error) {
            throw new Error(`Rate limit check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Проверить здоровье Redis
     *
     * @returns true если Redis доступен
     */
    isHealthy() {
        return this.redis.status === 'ready';
    }
    /**
     * Построить Redis ключ
     *
     * @param type - Тип лимита
     * @param identifier - Идентификатор
     * @returns Redis ключ
     *
     * @remarks
     * Формат: ratelimit:{type}:{identifier}
     * Пример: ratelimit:search:127.0.0.1
     */
    buildKey(type, identifier) {
        return [
            RedisRateLimitAdapter.KEY_PREFIX,
            type,
            identifier
        ].join(RedisRateLimitAdapter.KEY_SEPARATOR);
    }
    /**
     * Получить текущее значение счётчика
     *
     * @param key - Redis ключ
     * @returns Текущее значение
     *
     * @throws {Error} Если Redis недоступен
     */
    async getCurrent(key) {
        try {
            const result = await this.redis.incr(key);
            return result;
        }
        catch (error) {
            throw new Error(`Redis INCR failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Установить TTL для ключа
     *
     * @param key - Redis ключ
     * @param seconds - TTL в секундах
     *
     * @throws {Error} Если Redis недоступен
     */
    async setExpiration(key, seconds) {
        try {
            await this.redis.expire(key, seconds);
        }
        catch (error) {
            throw new Error(`Redis EXPIRE failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Получить TTL для ключа
     *
     * @param key - Redis ключ
     * @returns TTL в секундах
     *
     * @remarks
     * Возвращает -1 если ключ не существует
     * Возвращает -2 если ключ без TTL
     */
    async getTtl(key) {
        try {
            const ttl = await this.redis.ttl(key);
            // TTL возвращает -2 если ключ не существует, -1 если без TTL
            return ttl > 0 ? ttl : 0;
        }
        catch (error) {
            // При ошибке возвращаем 0 (сразу сброс)
            return 0;
        }
    }
}
exports.RedisRateLimitAdapter = RedisRateLimitAdapter;
