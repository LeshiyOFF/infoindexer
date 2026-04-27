/**
 * Migration Lock Adapter — реализация distributed lock через Redis
 *
 * @remarks
 * Infrastructure Adapter: реализует Port IMigrationLock.
 * Redlock algorithm: https://redis.io/docs/manual/patterns/distributed-locks/
 */
import type Redis from 'ioredis';
import type { IMigrationLock, MigrationLockOptions } from './ports/i-migration-lock.port';
/**
 * Migration Lock — реализация через Redis (Redlock algorithm)
 *
 * SRP: Только управление distributed lock
 * DIP: Зависит от абстракции Redis
 */
export declare class MigrationLock implements IMigrationLock {
    private readonly redis;
    constructor(redis: Redis);
    execute<T>(options: MigrationLockOptions, action: () => Promise<T>): Promise<T>;
    isAvailable(lockKey: string): Promise<boolean>;
    forceRelease(lockKey: string): Promise<void>;
    private acquire;
    private release;
    private generateToken;
    private randomDelay;
    private sleep;
}
/** Factory для создания MigrationLock */
export declare function createMigrationLock(redis: Redis): MigrationLock;
