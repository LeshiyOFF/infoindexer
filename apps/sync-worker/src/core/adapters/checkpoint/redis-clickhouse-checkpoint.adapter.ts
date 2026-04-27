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
export class RedisClickHouseCheckpointAdapter implements ICheckpointStorage {
  private readonly keyPrefix = 'sync:checkpoint:';
  private readonly redisTtl = 60 * 60 * 24 * 7; // 7 дней в секундах

  constructor(
    private readonly redis: Redis,
    private readonly clickhouse: ClickHouseClient
  ) {}

  async save(
    year: number,
    processedRows: number,
    percentage: number,
    checksum?: string
  ): Promise<void> {
    const data: CheckpointData = {
      processedRows,
      percentage,
      checksum,
      timestamp: Date.now()
    };

    await Promise.all([
      this.saveToRedis(year, data),
      this.saveToClickHouse(year, data)
    ]);
  }

  async load(year: number): Promise<CheckpointData | null> {
    const redisData = await this.loadFromRedis(year);
    if (redisData) {
      return redisData;
    }

    const chData = await this.loadFromClickHouse(year);
    if (chData) {
      await this.saveToRedis(year, chData);
      return chData;
    }

    return null;
  }

  async clear(year: number): Promise<void> {
    await Promise.all([
      this.clearRedis(year),
      this.clearClickHouse(year)
    ]);
  }

  async verify(year: number, expectedChecksum: string): Promise<boolean> {
    const saved = await this.load(year);
    return saved?.checksum === expectedChecksum;
  }

  private async saveToRedis(year: number, data: CheckpointData): Promise<void> {
    const key = `${this.keyPrefix}${year}`;
    await this.redis.setex(key, this.redisTtl, JSON.stringify(data));
  }

  private async saveToClickHouse(year: number, data: CheckpointData): Promise<void> {
    await this.clickhouse.insert({
      table: 'sync_checkpoints',
      values: [{
        year,
        processedRows: data.processedRows,
        percentage: data.percentage,
        checksum: data.checksum || '',
        timestamp: new Date(data.timestamp),
        updated_at: new Date()
      }],
      format: 'JSONEachRow'
    });
  }

  private async loadFromRedis(year: number): Promise<CheckpointData | null> {
    const key = `${this.keyPrefix}${year}`;
    const rawData = await this.redis.get(key);
    if (!rawData) {
      return null;
    }

    try {
      return JSON.parse(rawData) as CheckpointData;
    } catch {
      return null;
    }
  }

  private async loadFromClickHouse(year: number): Promise<CheckpointData | null> {
    const result = await this.clickhouse.query({
      query: `
        SELECT processedRows, percentage, checksum, timestamp
        FROM sync_checkpoints
        WHERE year = {year:UInt16}
        ORDER BY timestamp DESC
        LIMIT 1
      `,
      query_params: { year },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as CheckpointData[];
    return rows.length > 0 ? rows[0] : null;
  }

  private async clearRedis(year: number): Promise<void> {
    await this.redis.del(`${this.keyPrefix}${year}`);
  }

  private async clearClickHouse(year: number): Promise<void> {
    await this.clickhouse.command({
      query: 'ALTER TABLE sync_checkpoints DELETE WHERE year = {year:UInt16}',
      query_params: { year }
    });
  }
}
