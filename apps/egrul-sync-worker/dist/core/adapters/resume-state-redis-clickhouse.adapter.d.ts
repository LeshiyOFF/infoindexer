/**
 * Driven Adapter — хранилище состояния загрузки с поддержкой resume
 *
 * Dual-write: Redis (скорость) + ClickHouse (персистентность).
 */
import type { IResumeStateStorage, ResumeState } from '../ports';
import type Redis from 'ioredis';
import type { ClickHouseClient } from '@clickhouse/client';
export declare class ResumeStateRedisClickHouseAdapter implements IResumeStateStorage {
    private readonly redis;
    private readonly clickhouse;
    constructor(redis: Redis, clickhouse: ClickHouseClient);
    save(url: string, state: ResumeState): Promise<void>;
    load(url: string): Promise<ResumeState | null>;
    clear(url: string): Promise<void>;
    isValid(url: string, currentEtag: string): Promise<boolean>;
    private saveToRedis;
    private loadFromRedis;
    private clearFromRedis;
    private saveToClickHouse;
    private loadFromClickHouse;
    private clearFromClickHouse;
    private getRedisKey;
}
