/**
 * Port для работы с message bus
 *
 * @remarks
 * Абстракция над pub/sub messaging.
 */

/**
 * Обработчик сообщения с каналом
 */
export type MessageHandler = (channel: string, message: string) => void | Promise<void>;

/**
 * Port для работы с message bus
 */
export interface IMessageBus {
  /**
   * Подписывается на канал
   */
  subscribe(channel: string, handler: MessageHandler): Promise<void>;

  /**
   * Публикует сообщение в канал
   */
  publish(channel: string, message: string): Promise<void>;

  /**
   * Подписывается на несколько каналов
   */
  subscribeMultiple(channels: readonly string[], handler: MessageHandler): Promise<void>;
}
