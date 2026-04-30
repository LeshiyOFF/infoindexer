import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  }
};

export const redisPub = new Redis(redisOptions);
export const redisSub = new Redis(redisOptions);
export const redisClient = new Redis(redisOptions);

type PubSubNumSubResult = [string, string];

/**
 * Получить количество подписчиков на Redis канал
 *
 * @remarks
 * Использует PUBSUB NUMSUB команду для проверки количества активных подписчиков.
 *
 * @param channel - имя канала
 * @returns количество подписчиков
 */
export async function getSubscriberCount(channel: string): Promise<number> {
  const result = await redisClient.call('PUBSUB', 'NUMSUB', channel) as PubSubNumSubResult;

  if (result && Array.isArray(result) && result.length >= 2) {
    return parseInt(result[1], 10);
  }

  return 0;
}
