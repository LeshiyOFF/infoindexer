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
