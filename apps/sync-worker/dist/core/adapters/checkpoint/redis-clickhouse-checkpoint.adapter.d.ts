/**
 * Адаптер для хранения чекпоинтов в Redis + ClickHouse
 *
 * @remarks
 * Dual-write стратегия: Redis (быстрый доступ) + ClickHouse (персистентность).
 * При потере Redis данные восстанавливаются из ClickHouse.
 * Adapter layer (Infrastructure). Реализует порт ICheckpointStorage.
 */
import type { Redis } from 'ioredis';
import type { ClickHouseClient } from '@clickhouse/client';
import type { ICheckpointStorage, CheckpointData } from '../../ports';
/**
 * Dual-write checkpoint: Redis (fast) + ClickHouse (durable)
 */
export declare class RedisClickHouseCheckpointAdapter implements ICheckpointStorage {
    private readonly redis;
    private readonly clickhouse;
    private readonly keyPrefix;
    private readonly redisTtl;
    constructor(redis: Redis, clickhouse: ClickHouseClient);
    save(year: number, processedRows: number, percentage: number, checksum?: string): Promise<void>;
    load(year: number): Promise<CheckpointData | null>;
    clear(year: number): Promise<void>;
    verify(year: number, expectedChecksum: string): Promise<boolean>;
    private saveToRedis;
    private saveToClickHouse;
    private loadFromRedis;
    private loadFromClickHouse;
    private clearRedis;
    private clearClickHouse;
}
