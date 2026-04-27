/**
 * Адаптер для message bus через Redis pub/sub
 *
 * @remarks
 * Реализует IMessageBus порт с помощью Redis.
 */
import type { Redis } from 'ioredis';
import type { IMessageBus, MessageHandler } from '../../ports';
/**
 * Адаптер для message bus через Redis pub/sub
 */
export declare class RedisMessageBusAdapter implements IMessageBus {
    private readonly pub;
    private readonly sub;
    private readonly subscribers;
    constructor(pub: Redis, sub: Redis);
    /**
     * Настраивает слушатель сообщений Redis
     */
    private setupMessageListener;
    /**
     * Подписывается на канал
     */
    subscribe(channel: string, handler: MessageHandler): Promise<void>;
    /**
     * Подписывается на несколько каналов
     */
    subscribeMultiple(channels: readonly string[], handler: MessageHandler): Promise<void>;
    /**
     * Публикует сообщение в канал
     */
    publish(channel: string, message: string): Promise<void>;
}
