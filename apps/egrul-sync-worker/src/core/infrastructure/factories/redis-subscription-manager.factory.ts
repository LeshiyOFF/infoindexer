/**
 * Redis Subscription Manager Factory
 *
 * @remarks
 * Infrastructure Layer — Factory в Hexagonal Architecture.
 * Создаёт настроенный экземпляр RedisSubscriptionManagerAdapter.
 *
 * Принципы:
 * - Dependency Injection: создаёт зависимости адаптера
 * - Single Responsibility: только создание адаптера
 */

import type Redis from 'ioredis';
import { RedisSubscriptionManagerAdapter } from '../adapters/redis-subscription-manager.adapter';

export function createRedisSubscriptionManager(
  redisSub: Redis,
  logger: { info(msg: string): void; warn(msg: string): void; error(msg: string, err?: Error): void }
): RedisSubscriptionManagerAdapter {
  return new RedisSubscriptionManagerAdapter(redisSub, logger);
}
