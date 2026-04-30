"use strict";
/**
 * Migration Lock Adapter — реализация distributed lock через Redis
 *
 * @remarks
 * Infrastructure Adapter: реализует Port IMigrationLock.
 * Redlock algorithm: https://redis.io/docs/manual/patterns/distributed-locks/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationLock = void 0;
exports.createMigrationLock = createMigrationLock;
const crypto_1 = require("crypto");
/** Lua script для безопасного удаления lock (atomically check + delete) */
const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 минут
const DEFAULT_RETRY_COUNT = 3;
const RETRY_DELAY_MIN = 100;
const RETRY_DELAY_MAX = 500;
/**
 * Migration Lock — реализация через Redis (Redlock algorithm)
 *
 * SRP: Только управление distributed lock
 * DIP: Зависит от абстракции Redis
 */
class MigrationLock {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async execute(options, action) {
        const { lockKey, timeoutMs, owner, retryCount = DEFAULT_RETRY_COUNT, retryDelayMs } = options;
        const token = this.generateToken();
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            if (attempt > 0) {
                const delay = retryDelayMs ?? this.randomDelay();
                console.log(`[MigrationLock] retry ${attempt}/${retryCount} after ${delay}ms`);
                await this.sleep(delay);
            }
            const acquired = await this.acquire(lockKey, token, timeoutMs);
            if (acquired) {
                console.log(`[MigrationLock] acquired: ${lockKey} by ${owner}`);
                try {
                    return await action();
                }
                finally {
                    await this.release(lockKey, token);
                    console.log(`[MigrationLock] released: ${lockKey}`);
                }
            }
        }
        const currentOwner = await this.redis.get(lockKey);
        throw new Error(`MigrationLock: failed to acquire ${lockKey} after ${retryCount + 1} attempts. ` +
            `Current owner: ${currentOwner || 'unknown'}. ` +
            `Use forceRelease() if stuck.`);
    }
    async isAvailable(lockKey) {
        return (await this.redis.exists(lockKey)) === 0;
    }
    async forceRelease(lockKey) {
        await this.redis.del(lockKey);
        console.warn(`[MigrationLock] force released: ${lockKey}`);
    }
    async acquire(lockKey, token, timeoutMs) {
        const result = await this.redis.set(lockKey, token, 'PX', timeoutMs, 'NX');
        return result === 'OK';
    }
    async release(lockKey, token) {
        try {
            await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, token);
        }
        catch (error) {
            console.error('[MigrationLock] release failed', error);
        }
    }
    generateToken() {
        const random = (0, crypto_1.randomBytes)(16).toString('hex');
        const timestamp = Date.now();
        return `${timestamp}-${random}`;
    }
    randomDelay() {
        return Math.floor(Math.random() * (RETRY_DELAY_MAX - RETRY_DELAY_MIN + 1) + RETRY_DELAY_MIN);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.MigrationLock = MigrationLock;
/** Factory для создания MigrationLock */
function createMigrationLock(redis) {
    return new MigrationLock(redis);
}
