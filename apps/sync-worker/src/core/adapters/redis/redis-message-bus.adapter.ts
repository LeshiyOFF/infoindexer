/**
 * Адаптер для message bus через Redis pub/sub
 *
 * @remarks
 * Реализует IMessageBus порт с помощью Redis.
 */

import type { Redis } from 'ioredis';
import type { IMessageBus, MessageHandler } from '../../ports';

/**
 * Тип обработчика для Redis (принимает только message)
 */
type RedisMessageHandler = (message: string) => void | Promise<void>;

/**
 * Адаптер для message bus через Redis pub/sub
 */
export class RedisMessageBusAdapter implements IMessageBus {
  private readonly subscribers = new Map<string, RedisMessageHandler>();

  constructor(
    private readonly pub: Redis,
    private readonly sub: Redis
  ) {
    this.setupMessageListener();
  }

  /**
   * Настраивает слушатель сообщений Redis
   */
  private setupMessageListener(): void {
    this.sub.on('message', (channel: string, message: string) => {
      const handler = this.subscribers.get(channel);
      if (handler) {
        handler(message);
      }
    });
  }

  /**
   * Подписывается на канал
   */
  async subscribe(channel: string, handler: MessageHandler): Promise<void> {
    await this.sub.subscribe(channel);

    this.subscribers.set(channel, (message) => handler(channel, message));
  }

  /**
   * Подписывается на несколько каналов
   */
  async subscribeMultiple(channels: readonly string[], handler: MessageHandler): Promise<void> {
    for (const channel of channels) {
      await this.subscribe(channel, handler);
    }
  }

  /**
   * Публикует сообщение в канал
   */
  async publish(channel: string, message: string): Promise<void> {
    await this.pub.publish(channel, message);
  }
}
