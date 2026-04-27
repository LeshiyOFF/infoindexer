"use strict";
/**
 * Адаптер для хранения чекпоинтов в Redis + ClickHouse
 *
 * @remarks
 * Dual-write стратегия: Redis (быстрый доступ) + ClickHouse (персистентность).
 * При потере Redis данные восстанавливаются из ClickHouse.
 * Adapter layer (Infrastructure). Реализует порт ICheckpointStorage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClickHouseCheckpointAdapter = void 0;
/**
 * Dual-write checkpoint: Redis (fast) + ClickHouse (durable)
 */
class RedisClickHouseCheckpointAdapter {
    redis;
    clickhouse;
    keyPrefix = 'sync:checkpoint:';
    redisTtl = 60 * 60 * 24 * 7; // 7 дней в секундах
    constructor(redis, clickhouse) {
        this.redis = redis;
        this.clickhouse = clickhouse;
    }
    async save(year, processedRows, percentage, checksum) {
        const data = {
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
    async load(year) {
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
    async clear(year) {
        await Promise.all([
            this.clearRedis(year),
            this.clearClickHouse(year)
        ]);
    }
    async verify(year, expectedChecksum) {
        const saved = await this.load(year);
        return saved?.checksum === expectedChecksum;
    }
    async saveToRedis(year, data) {
        const key = `${this.keyPrefix}${year}`;
        await this.redis.setex(key, this.redisTtl, JSON.stringify(data));
    }
    async saveToClickHouse(year, data) {
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
    async loadFromRedis(year) {
        const key = `${this.keyPrefix}${year}`;
        const rawData = await this.redis.get(key);
        if (!rawData) {
            return null;
        }
        try {
            return JSON.parse(rawData);
        }
        catch {
            return null;
        }
    }
    async loadFromClickHouse(year) {
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
        const rows = await result.json();
        return rows.length > 0 ? rows[0] : null;
    }
    async clearRedis(year) {
        await this.redis.del(`${this.keyPrefix}${year}`);
    }
    async clearClickHouse(year) {
        await this.clickhouse.command({
            query: 'ALTER TABLE sync_checkpoints DELETE WHERE year = {year:UInt16}',
            query_params: { year }
        });
    }
}
exports.RedisClickHouseCheckpointAdapter = RedisClickHouseCheckpointAdapter;
