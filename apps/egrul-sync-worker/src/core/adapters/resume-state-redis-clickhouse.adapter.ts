/**
 * Driven Adapter — хранилище состояния загрузки с поддержкой resume
 *
 * Dual-write: Redis (скорость) + ClickHouse (персистентность).
 */

import type { IResumeStateStorage, ResumeState } from '../ports';
import type Redis from 'ioredis';
import type { ClickHouseClient } from '@clickhouse/client';

const REDIS_TTL_SECONDS = 7 * 24 * 60 * 60;
const REDIS_KEY_PREFIX = 'resume_state:';

interface RowData {
  url: string;
  downloadedBytes: number;
  totalBytes: number;
  etag: string;
  lastModified: string;
  timestamp: string;
}

export class ResumeStateRedisClickHouseAdapter implements IResumeStateStorage {
  constructor(
    private readonly redis: Redis,
    private readonly clickhouse: ClickHouseClient
  ) {}

  async save(url: string, state: ResumeState): Promise<void> {
    const [redisError, chError] = await Promise.allSettled([
      this.saveToRedis(url, state),
      this.saveToClickHouse(url, state)
    ]);

    if (redisError.status === 'rejected') {
      console.error('Redis save failed, ClickHouse succeeded:', redisError.reason);
    }

    if (chError.status === 'rejected') {
      throw new Error(`Failed to save resume state: ${chError.reason}`);
    }
  }

  async load(url: string): Promise<ResumeState | null> {
    const fromRedis = await this.loadFromRedis(url);
    if (fromRedis) {
      return fromRedis;
    }

    const fromClickHouse = await this.loadFromClickHouse(url);
    if (fromClickHouse) {
      this.saveToRedis(url, fromClickHouse).catch(console.error);
      return fromClickHouse;
    }

    return null;
  }

  async clear(url: string): Promise<void> {
    const [redisError, chError] = await Promise.allSettled([
      this.clearFromRedis(url),
      this.clearFromClickHouse(url)
    ]);

    if (redisError.status === 'rejected') {
      console.error('Redis clear failed:', redisError.reason);
    }

    if (chError.status === 'rejected') {
      throw new Error(`Failed to clear resume state: ${chError.reason}`);
    }
  }

  async isValid(url: string, currentEtag: string): Promise<boolean> {
    const state = await this.load(url);
    if (!state || !state.etag) {
      return false;
    }
    return state.etag === currentEtag;
  }

  private async saveToRedis(url: string, state: ResumeState): Promise<void> {
    const key = this.getRedisKey(url);
    await this.redis.setex(key, REDIS_TTL_SECONDS, JSON.stringify(state));
  }

  private async loadFromRedis(url: string): Promise<ResumeState | null> {
    const key = this.getRedisKey(url);
    const value = await this.redis.get(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as ResumeState;
    } catch {
      return null;
    }
  }

  private async clearFromRedis(url: string): Promise<void> {
    await this.redis.del(this.getRedisKey(url));
  }

  private async saveToClickHouse(url: string, state: ResumeState): Promise<void> {
    await this.clickhouse.insert({
      table: 'resume_states',
      values: [{
        url,
        downloadedBytes: state.downloadedBytes,
        totalBytes: state.totalBytes,
        etag: state.etag || '',
        lastModified: state.lastModified || '',
        timestamp: new Date(state.timestamp)
      }]
    });
  }

  private async loadFromClickHouse(url: string): Promise<ResumeState | null> {
    const resultSet = await this.clickhouse.query({
      query: `SELECT url, downloadedBytes, totalBytes, etag, lastModified, timestamp
             FROM resume_states WHERE url = {url:String}
             ORDER BY timestamp DESC LIMIT 1`,
      query_params: { url },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json() as RowData[];
    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      url: row.url,
      downloadedBytes: row.downloadedBytes,
      totalBytes: row.totalBytes,
      etag: row.etag || undefined,
      lastModified: row.lastModified || undefined,
      timestamp: new Date(row.timestamp).getTime()
    };
  }

  private async clearFromClickHouse(url: string): Promise<void> {
    await this.clickhouse.insert({
      table: 'resume_states',
      values: [{
        url,
        downloadedBytes: 0,
        totalBytes: 0,
        etag: '',
        lastModified: '',
        timestamp: new Date(0),
        updated_at: new Date()
      }]
    });
  }

  private getRedisKey(url: string): string {
    return `${REDIS_KEY_PREFIX}${Buffer.from(url).toString('base64').substring(0, 32)}`;
  }
}
