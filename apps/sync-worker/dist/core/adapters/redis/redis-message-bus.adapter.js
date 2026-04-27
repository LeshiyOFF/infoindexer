"use strict";
/**
 * Адаптер для message bus через Redis pub/sub
 *
 * @remarks
 * Реализует IMessageBus порт с помощью Redis.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisMessageBusAdapter = void 0;
/**
 * Адаптер для message bus через Redis pub/sub
 */
class RedisMessageBusAdapter {
    pub;
    sub;
    subscribers = new Map();
    constructor(pub, sub) {
        this.pub = pub;
        this.sub = sub;
        this.setupMessageListener();
    }
    /**
     * Настраивает слушатель сообщений Redis
     */
    setupMessageListener() {
        this.sub.on('message', (channel, message) => {
            const handler = this.subscribers.get(channel);
            if (handler) {
                handler(message);
            }
        });
    }
    /**
     * Подписывается на канал
     */
    async subscribe(channel, handler) {
        await this.sub.subscribe(channel);
        this.subscribers.set(channel, (message) => handler(channel, message));
    }
    /**
     * Подписывается на несколько каналов
     */
    async subscribeMultiple(channels, handler) {
        for (const channel of channels) {
            await this.subscribe(channel, handler);
        }
    }
    /**
     * Публикует сообщение в канал
     */
    async publish(channel, message) {
        await this.pub.publish(channel, message);
    }
}
exports.RedisMessageBusAdapter = RedisMessageBusAdapter;
