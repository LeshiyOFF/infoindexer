/**
 * Redis Distributed Lock Adapter
 *
 * @remarks
 * Infrastructure Layer: реализует IDistributedLock через Redis.
 * Использует SET NX (SET if Not eXists) для атомарного захвата.
 */
/**
 * Значения по умолчанию
 */
const DEFAULT_TTL = 60000; // 1 минута
const DEFAULT_WAIT_TIMEOUT = 5000; // 5 секунд
const LOCK_PREFIX = 'lock:';
/**
 * Redis Distributed Lock Adapter
 *
 * @remarks
 * Реализует распределённую блокировку через Redis SET NX.
 * Использует уникальный токен для безопасного освобождения.
 */
export class RedisDistributedLockAdapter {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
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
    async acquireLock(resource, options) {
        const ttl = options?.ttl ?? DEFAULT_TTL;
        const waitTimeout = options?.waitTimeout ?? DEFAULT_WAIT_TIMEOUT;
        const instanceId = options?.instanceId ?? this.generateInstanceId();
        const lockKey = LOCK_PREFIX + resource;
        const lockId = this.generateLockId(instanceId);
        const expiresAt = Date.now() + ttl;
        const startTime = Date.now();
        let attempt = 0;
        while (Date.now() - startTime < waitTimeout) {
            attempt++;
            // Пытаемся захватить lock (SET NX)
            const acquired = await this.redis.set(lockKey, lockId, 'PX', ttl, 'NX');
            if (acquired === 'OK') {
                console.log(`[Lock] Acquired '${resource}' (attempt ${attempt}, id: ${lockId})`);
                return {
                    id: lockId,
                    resource,
                    expiresAt
                };
            }
            // Lock захвачен другим экземпляром
            const ttlMs = await this.redis.pttl(lockKey);
            if (attempt === 1) {
                console.log(`[Lock] Waiting for '${resource}' (locked by another instance, TTL: ${ttlMs}ms)`);
            }
            // Экспоненциальная задержка между попытками
            const delay = Math.min(100 * Math.pow(2, attempt - 1), 500);
            await this.sleep(delay);
        }
        console.warn(`[Lock] Failed to acquire '${resource}' after ${attempt} attempts (timeout: ${waitTimeout}ms)`);
        return null;
    }
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
    async releaseLock(lock) {
        const lockKey = LOCK_PREFIX + lock.resource;
        // Lua скрипт: удаляем только если значение совпадает
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        const result = await this.redis.eval(script, 1, lockKey, lock.id);
        if (result === 1) {
            console.log(`[Lock] Released '${lock.resource}' (id: ${lock.id})`);
        }
        else {
            console.warn(`[Lock] Lost '${lock.resource}' (already expired or stolen)`);
        }
    }
    /**
     * Проверяет захвачен ли lock
     *
     * @param resource - Имя ресурса
     * @returns true если захвачен
     */
    async isLocked(resource) {
        const lockKey = LOCK_PREFIX + resource;
        const exists = await this.redis.exists(lockKey);
        return exists === 1;
    }
    /**
     * Генерирует уникальный ID для lock
     *
     * @param instanceId - Идентификатор экземпляра
     * @returns Уникальный ID
     */
    generateLockId(instanceId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `${instanceId}-${timestamp}-${random}`;
    }
    /**
     * Генерирует идентификатор экземпляра
     *
     * @returns ID экземпляра
     */
    generateInstanceId() {
        return `instance-${process.env.HOSTNAME || 'local'}-${process.pid}`;
    }
    /**
     * Задержка выполнения
     *
     * @param ms - Миллисекунды
     * @returns Promise
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
