"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.redisSub = exports.redisPub = void 0;
exports.getSubscriberCount = getSubscriberCount;
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    }
};
exports.redisPub = new ioredis_1.default(redisOptions);
exports.redisSub = new ioredis_1.default(redisOptions);
exports.redisClient = new ioredis_1.default(redisOptions);
/**
 * Получить количество подписчиков на Redis канал
 *
 * @remarks
 * Использует PUBSUB NUMSUB команду для проверки количества активных подписчиков.
 *
 * @param channel - имя канала
 * @returns количество подписчиков
 */
async function getSubscriberCount(channel) {
    const result = await exports.redisClient.call('PUBSUB', 'NUMSUB', channel);
    if (result && Array.isArray(result) && result.length >= 2) {
        return parseInt(result[1], 10);
    }
    return 0;
}
