/**
 * Port для управления подписками на Redis Pub/Sub каналы
 *
 * @remarks
 * Infrastructure Layer — Port в Hexagonal Architecture.
 * Определяет контракт для управления подписками с автоматической
 * переподпиской при потере соединения.
 *
 * Принципы:
 * - Dependency Inversion: высокоуровневые модули зависят от этого Port,
 *   не от конкретной реализации Redis
 * - Interface Segregation: минимальный интерфейс для подписки
 */

export interface IRedisSubscriptionManagerPort {
  /**
   * Подписаться на каналы
   *
   * @param channels - массив имён каналов для подписки
   * @throws RedisSubscriptionError если подписка не удалась
   */
  subscribe(channels: string[]): Promise<void>;

  /**
   * Проверить активность подписки
   *
   * @returns true если подключено и подписано, false иначе
   */
  isConnected(): boolean;

  /**
   * Получить список каналов на которые подписаны
   *
   * @returns массив имён каналов
   */
  getSubscribedChannels(): string[];

  /**
   * Остановить менеджер подписок
   *
   * @remarks
   * Отписывается от всех каналов и очищает обработчики событий.
   * Должен вызываться при graceful shutdown.
   */
  stop(): Promise<void>;
}

/**
 * Ошибка подписки на Redis канал
 */
export class RedisSubscriptionError extends Error {
  constructor(message: string, public readonly cause: Error | null = null) {
    super(message);
    this.name = 'RedisSubscriptionError';
  }
}
