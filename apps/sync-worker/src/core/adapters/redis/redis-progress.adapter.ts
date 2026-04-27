/**
 * Адаптер для отчёта о прогрессе через Redis
 *
 * @remarks
 * Реализует IProgressReporter порт с помощью Redis.
 */

import type { Redis } from 'ioredis';
import type { IProgressReporter } from '../../ports';
import type { SyncProgress } from '../../types';

/**
 * Адаптер для отчёта о прогрессе через Redis
 */
export class RedisProgressAdapter implements IProgressReporter {
  constructor(private readonly redis: Redis) {}

  /**
   * Сохраняет прогресс синхронизации
   */
  async report(year: number, progress: SyncProgress): Promise<void> {
    const key = `sync:status:${year}`;

    if (progress.status === 'running' || progress.status === 'completed') {
      await this.redis.hdel(key, 'error');
    }

    const data: Record<string, string | number> = {
      status: progress.status,
      percentage: progress.percentage,
      rows_processed: progress.rows_processed
    };

    if (progress.completed_at !== undefined) {
      data.completed_at = progress.completed_at;
    }

    if (progress.error !== undefined) {
      data.error = progress.error;
    }

    if (progress.timestamp !== undefined) {
      data.timestamp = progress.timestamp;
    }

    await this.redis.hset(key, data);
  }

  /**
   * Удаляет информацию об ошибке
   */
  async clearError(year: number): Promise<void> {
    await this.redis.hdel(`sync:status:${year}`, 'error');
  }
}
