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
import Redis from 'ioredis';
import type { RateLimitType } from '../../domain/rate-limit';
import { RateLimitResult } from '../../domain/rate-limit';
import type { IRateLimitPort, RateLimitCheckOptions } from '../ports/i-rate-limit.port';
/**
 * Redis Rate Limit Adapter
 *
 * @remarks
 * Реализует rate limiting через Redis INCR/EXPIRE.
 * Race-condition free благодаря атомарным операциям.
 */
export declare class RedisRateLimitAdapter implements IRateLimitPort {
    private static readonly KEY_PREFIX;
    private static readonly KEY_SEPARATOR;
    private readonly redis;
    constructor(redis: Redis);
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
    check(identifier: string, type: RateLimitType, options?: RateLimitCheckOptions): Promise<RateLimitResult>;
    /**
     * Проверить здоровье Redis
     *
     * @returns true если Redis доступен
     */
    isHealthy(): boolean;
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
    private buildKey;
    /**
     * Получить текущее значение счётчика
     *
     * @param key - Redis ключ
     * @returns Текущее значение
     *
     * @throws {Error} Если Redis недоступен
     */
    private getCurrent;
    /**
     * Установить TTL для ключа
     *
     * @param key - Redis ключ
     * @param seconds - TTL в секундах
     *
     * @throws {Error} Если Redis недоступен
     */
    private setExpiration;
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
    private getTtl;
}
