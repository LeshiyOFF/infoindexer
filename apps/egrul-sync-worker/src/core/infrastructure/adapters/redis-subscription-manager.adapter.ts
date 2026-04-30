/**
 * Redis Subscription Manager Adapter
 *
 * @remarks
 * Infrastructure Layer — Adapter в Hexagonal Architecture.
 * Реализует IRedisSubscriptionManagerPort с автоматической
 * переподпиской при потере соединения.
 *
 * Решает проблему: ioredis не восстанавливает подписки при reconnect.
 *
 * Принципы:
 * - Single Responsibility: только управление подписками
 * - Open/Closed: закрыт для модификации, открыт для расширения
 * - Dependency Inversion: зависит от абстракции Redis, не от деталей
 */

import type Redis from 'ioredis';
import type {
  IRedisSubscriptionManagerPort,
  RedisSubscriptionError
} from '../../ports/i-redis-subscription-manager.port';

const RESUBSCRIBE_DELAY_MS = 5000;
const MAX_RESUBSCRIBE_ATTEMPTS = 10;

export class RedisSubscriptionManagerAdapter implements IRedisSubscriptionManagerPort {
  private subscribedChannels: string[] = [];
  private connected = false;
  private resubscribeAttempts = 0;
  private stopRequested = false;

  constructor(
    private readonly redisSub: Redis,
    private readonly logger: { info(msg: string): void; warn(msg: string): void; error(msg: string, err?: Error): void }
  ) {
    this.setupEventHandlers();
  }

  subscribe(channels: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stopRequested) {
        reject(new Error('SubscriptionManager stopped'));
        return;
      }

      this.redisSub.subscribe(...channels, (error) => {
        if (error) {
          this.logger.error(`[RedisSubscriptionManager] Subscribe failed: ${error.message}`, error);
          reject(new Error(`Failed to subscribe to channels: ${error.message}`));
          return;
        }

        this.subscribedChannels = [...channels];
        this.connected = true;
        this.resubscribeAttempts = 0;

        this.logger.info(
          `[RedisSubscriptionManager] Subscribed to channels: ${channels.join(', ')}`
        );

        resolve();
      });
    });
  }

  isConnected(): boolean {
    return this.connected && this.redisSub.status === 'ready';
  }

  getSubscribedChannels(): string[] {
    return [...this.subscribedChannels];
  }

  async stop(): Promise<void> {
    this.stopRequested = true;

    if (this.subscribedChannels.length > 0) {
      await this.redisSub.unsubscribe(...this.subscribedChannels);
      this.subscribedChannels = [];
    }

    this.connected = false;
    this.logger.info('[RedisSubscriptionManager] Stopped');
  }

  private setupEventHandlers(): void {
    this.redisSub.on('connect', () => {
      this.logger.info('[RedisSubscriptionManager] Redis connecting...');
    });

    this.redisSub.on('ready', () => {
      this.connected = true;
      this.logger.info('[RedisSubscriptionManager] Redis connection ready');

      if (this.subscribedChannels.length > 0) {
        this.resubscribe();
      }
    });

    this.redisSub.on('reconnecting', () => {
      this.connected = false;
      this.logger.warn('[RedisSubscriptionManager] Redis reconnecting...');
    });

    this.redisSub.on('error', (error) => {
      this.logger.error(`[RedisSubscriptionManager] Redis connection error: ${error.message}`, error);
    });

    this.redisSub.on('end', () => {
      this.connected = false;
      this.logger.warn('[RedisSubscriptionManager] Redis connection ended');
    });
  }

  private resubscribe(): void {
    if (this.stopRequested) {
      return;
    }

    if (this.subscribedChannels.length === 0) {
      return;
    }

    if (this.resubscribeAttempts >= MAX_RESUBSCRIBE_ATTEMPTS) {
      this.logger.error(
        `[RedisSubscriptionManager] Max resubscribe attempts (${MAX_RESUBSCRIBE_ATTEMPTS}) reached`
      );
      return;
    }

    this.resubscribeAttempts++;

    this.logger.info(
      `[RedisSubscriptionManager] Resubscribing to channels (attempt ${this.resubscribeAttempts})`
    );

    const channels = [...this.subscribedChannels];

    this.redisSub.subscribe(...channels, (error) => {
      if (error) {
        this.logger.error(
          `[RedisSubscriptionManager] Resubscribe failed: ${error.message}. Retrying in ${RESUBSCRIBE_DELAY_MS}ms`,
          error
        );

        setTimeout(() => this.resubscribe(), RESUBSCRIBE_DELAY_MS);
        return;
      }

      this.connected = true;
      this.resubscribeAttempts = 0;

      this.logger.info(
        `[RedisSubscriptionManager] Successfully resubscribed to: ${channels.join(', ')}`
      );
    });
  }
}
