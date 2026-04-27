import { Redis } from 'ioredis';

/**
 * Состояние прогресса синхронизации EGRUL
 */
export interface EgrulProgressState {
  status: string;
  percentage?: number;
  message?: string;
  error?: string;
  updated_at?: string;
  completed_at?: string;
  rows_processed?: number;
}

/**
 * Reporter для отправки прогресса в Redis
 */
export class ProgressReporter {
  constructor(private readonly redis: Redis, private readonly channel = 'sync:status:egrul') {}

  /**
   * Отправляет состояние прогресса в Redis
   *
   * @param state - Состояние прогресса
   */
  async report(state: EgrulProgressState): Promise<void> {
    const record: Record<string, string> = {};
    const keysToDelete: string[] = [];

    Object.entries(state).forEach(([key, value]) => {
      if (value === undefined) {
        keysToDelete.push(key);
      } else {
        record[key] = String(value);
      }
    });

    if (Object.keys(record).length > 0) {
      await this.redis.hset(this.channel, record);
    }
    if (keysToDelete.length > 0) {
      await this.redis.hdel(this.channel, ...keysToDelete);
    }
  }

  /**
   * Создаёт состояние с заданным статусом
   *
   * @param status - Статус операции
   * @param percentage - Процент выполнения
   * @param message - Сообщение
   * @param rowsProcessed - Обработано строк
   * @returns Состояние прогресса
   */
  createState(
    status: string,
    percentage?: number,
    message?: string,
    rowsProcessed?: number
  ): EgrulProgressState {
    return {
      status,
      percentage,
      message,
      rows_processed: rowsProcessed,
      updated_at: new Date().toISOString()
    };
  }
}

/**
 * Фабрика для создания ProgressReporter
 */
export class ProgressReporterFactory {
  private static egrulInstance: ProgressReporter | null = null;
  private static sanctionsInstance: ProgressReporter | null = null;

  /**
   * Создаёт репортёр для синхронизации ЕГРЮЛ
   */
  static create(redis: Redis): ProgressReporter {
    if (!this.egrulInstance) {
      this.egrulInstance = new ProgressReporter(redis, 'sync:status:egrul');
    }
    return this.egrulInstance;
  }

  /**
   * Создаёт репортёр для синхронизации санкций
   */
  static createForSanctions(redis: Redis = require('shared').redisClient): ProgressReporter {
    if (!this.sanctionsInstance) {
      this.sanctionsInstance = new ProgressReporter(redis, 'sync:status:sanctions');
    }
    return this.sanctionsInstance;
  }
}
