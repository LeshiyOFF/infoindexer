/**
 * Redis Distributed Lock Adapter
 *
 * @remarks
 * Infrastructure Layer: реализует IDistributedLock через Redis.
 * Использует SET NX (SET if Not eXists) для атомарного захвата.
 */
import type { Redis } from 'ioredis';
import type { IDistributedLock, Lock, LockOptions } from '../ports';
/**
 * Redis Distributed Lock Adapter
 *
 * @remarks
 * Реализует распределённую блокировку через Redis SET NX.
 * Использует уникальный токен для безопасного освобождения.
 */
export declare class RedisDistributedLockAdapter implements IDistributedLock {
    private readonly redis;
    constructor(redis: Redis);
    /**
     * Пытается захватить lock
     *
     * @param resource - Имя ресурса
     * @param options - Опции захвата
     * @returns Lock если захвачен, null если timeout
     *
     * @remarks
     * Использует SET NX (SET if Not eXists) для атомарного захвата.
     * Повторяет попытки с экспоненциальной задержкой.
     */
    acquireLock(resource: string, options?: LockOptions): Promise<Lock | null>;
    /**
     * Освобождает lock
     *
     * @param lock - Lock для освобождения
     * @returns Promise<void>
     *
     * @remarks
     * Безопасно освобождает lock только если он принадлежит этому экземпляру.
     * Использует Lua скрипт для атомарности.
     */
    releaseLock(lock: Lock): Promise<void>;
    /**
     * Проверяет захвачен ли lock
     *
     * @param resource - Имя ресурса
     * @returns true если захвачен
     */
    isLocked(resource: string): Promise<boolean>;
    /**
     * Генерирует уникальный ID для lock
     *
     * @param instanceId - Идентификатор экземпляра
     * @returns Уникальный ID
     */
    private generateLockId;
    /**
     * Генерирует идентификатор экземпляра
     *
     * @returns ID экземпляра
     */
    private generateInstanceId;
    /**
     * Задержка выполнения
     *
     * @param ms - Миллисекунды
     * @returns Promise
     */
    private sleep;
}
