"use strict";
/**
 * Адаптер для отчёта о прогрессе через Redis
 *
 * @remarks
 * Реализует IProgressReporter порт с помощью Redis.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisProgressAdapter = void 0;
/**
 * Адаптер для отчёта о прогрессе через Redis
 */
class RedisProgressAdapter {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    /**
     * Сохраняет прогресс синхронизации
     */
    async report(year, progress) {
        const key = `sync:status:${year}`;
        if (progress.status === 'running' || progress.status === 'completed') {
            await this.redis.hdel(key, 'error');
        }
        const data = {
            status: progress.status,
            percentage: progress.percentage,
            rows_processed: progress.rows_processed
        };
        if (progress.completed_at !== undefined) {
            data.completed_at = progress.completed_at;
        }
        if (progress.error !== undefined) {
            data.error = progress.error;
        }
        if (progress.timestamp !== undefined) {
            data.timestamp = progress.timestamp;
        }
        await this.redis.hset(key, data);
    }
    /**
     * Удаляет информацию об ошибке
     */
    async clearError(year) {
        await this.redis.hdel(`sync:status:${year}`, 'error');
    }
}
exports.RedisProgressAdapter = RedisProgressAdapter;
