"use strict";
/**
 * Driven Adapter — хранилище состояния загрузки с поддержкой resume
 *
 * Dual-write: Redis (скорость) + ClickHouse (персистентность).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeStateRedisClickHouseAdapter = void 0;
const REDIS_TTL_SECONDS = 7 * 24 * 60 * 60;
const REDIS_KEY_PREFIX = 'resume_state:';
class ResumeStateRedisClickHouseAdapter {
    redis;
    clickhouse;
    constructor(redis, clickhouse) {
        this.redis = redis;
        this.clickhouse = clickhouse;
    }
    async save(url, state) {
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
    async load(url) {
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
    async clear(url) {
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
    async isValid(url, currentEtag) {
        const state = await this.load(url);
        if (!state || !state.etag) {
            return false;
        }
        return state.etag === currentEtag;
    }
    async saveToRedis(url, state) {
        const key = this.getRedisKey(url);
        await this.redis.setex(key, REDIS_TTL_SECONDS, JSON.stringify(state));
    }
    async loadFromRedis(url) {
        const key = this.getRedisKey(url);
        const value = await this.redis.get(key);
        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    }
    async clearFromRedis(url) {
        await this.redis.del(this.getRedisKey(url));
    }
    async saveToClickHouse(url, state) {
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
    async loadFromClickHouse(url) {
        const resultSet = await this.clickhouse.query({
            query: `SELECT url, downloadedBytes, totalBytes, etag, lastModified, timestamp
             FROM resume_states WHERE url = {url:String}
             ORDER BY timestamp DESC LIMIT 1`,
            query_params: { url },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
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
    async clearFromClickHouse(url) {
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
    getRedisKey(url) {
        return `${REDIS_KEY_PREFIX}${Buffer.from(url).toString('base64').substring(0, 32)}`;
    }
}
exports.ResumeStateRedisClickHouseAdapter = ResumeStateRedisClickHouseAdapter;
