"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReporterFactory = exports.ProgressReporter = void 0;
/**
 * Reporter для отправки прогресса в Redis
 */
class ProgressReporter {
    redis;
    channel;
    constructor(redis, channel = 'sync:status:egrul') {
        this.redis = redis;
        this.channel = channel;
    }
    /**
     * Отправляет состояние прогресса в Redis
     *
     * @param state - Состояние прогресса
     */
    async report(state) {
        const record = {};
        const keysToDelete = [];
        Object.entries(state).forEach(([key, value]) => {
            if (value === undefined) {
                keysToDelete.push(key);
            }
            else {
                record[key] = String(value);
            }
        });
        if (Object.keys(record).length > 0) {
            await this.redis.hset(this.channel, record);
        }
        if (keysToDelete.length > 0) {
            await this.redis.hdel(this.channel, ...keysToDelete);
        }
    }
    /**
     * Создаёт состояние с заданным статусом
     *
     * @param status - Статус операции
     * @param percentage - Процент выполнения
     * @param message - Сообщение
     * @param rowsProcessed - Обработано строк
     * @returns Состояние прогресса
     */
    createState(status, percentage, message, rowsProcessed) {
        return {
            status,
            percentage,
            message,
            rows_processed: rowsProcessed,
            updated_at: new Date().toISOString()
        };
    }
}
exports.ProgressReporter = ProgressReporter;
/**
 * Фабрика для создания ProgressReporter
 */
class ProgressReporterFactory {
    static egrulInstance = null;
    static sanctionsInstance = null;
    /**
     * Создаёт репортёр для синхронизации ЕГРЮЛ
     */
    static create(redis) {
        if (!this.egrulInstance) {
            this.egrulInstance = new ProgressReporter(redis, 'sync:status:egrul');
        }
        return this.egrulInstance;
    }
    /**
     * Создаёт репортёр для синхронизации санкций
     */
    static createForSanctions(redis = require('shared').redisClient) {
        if (!this.sanctionsInstance) {
            this.sanctionsInstance = new ProgressReporter(redis, 'sync:status:sanctions');
        }
        return this.sanctionsInstance;
    }
}
exports.ProgressReporterFactory = ProgressReporterFactory;
