/**
 * Redis адаптер для отмены операций
 *
 * @remarks
 * Публикует команды отмены в Redis Pub/Sub.
 * Реализует порт IAbortHandler.
 */

import type { Redis } from 'ioredis';
import type { IAbortHandler } from '../ports/abort.port';
import { serializeAbortCommand, type AbortCommand } from '../../domain/abort/abort-command.dto';

/**
 * Каналы Redis для отмены операций
 */
export const ABORT_CHANNELS = {
  financialSync: 'sync:abort',
  egrulSync: 'sync:egrul:abort',
  sanctionsSync: 'sync:sanctions:abort',
  summaryRefresh: 'refresh-summary:abort'
} as const;

/**
 * Redis адаптер для отмены операций
 */
export class RedisAbortAdapter implements IAbortHandler {
  constructor(private readonly redis: Redis) {}

  /**
   * Отменяет операцию через Redis Pub/Sub
   */
  async abort(operationId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Определяем тип операции по operationId
      const operationType = this.detectOperationType(operationId);
      const channel = this.getChannelForType(operationType);

      const command: AbortCommand = {
        operationId,
        operationType,
        timestamp: Date.now()
      };

      await this.redis.publish(channel, serializeAbortCommand(command));

      return {
        success: true,
        message: 'Команда отмены отправлена'
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message
      };
    }
  }

  /**
   * Определяет тип операции по ID
   */
  private detectOperationType(operationId: string): AbortCommand['operationType'] {
    // Годовые данные (финансовые отчёты)
    if (/^\d{4}$/.test(operationId)) {
      return 'financial-sync';
    }

    // ЕГРЮЛ
    if (operationId === 'egrul' || operationId.startsWith('egrul:')) {
      return 'egrul-sync';
    }

    // Санкции
    if (operationId === 'sanctions' || operationId.startsWith('sanctions:')) {
      return 'sanctions-sync';
    }

    // Summary/Cache
    if (operationId === 'summary' || operationId.startsWith('summary:')) {
      return 'summary-refresh';
    }

    // По умолчанию
    return 'financial-sync';
  }

  /**
   * Возвращает канал для типа операции
   */
  private getChannelForType(operationType: AbortCommand['operationType']): string {
    switch (operationType) {
      case 'egrul-sync':
        return ABORT_CHANNELS.egrulSync;
      case 'sanctions-sync':
        return ABORT_CHANNELS.sanctionsSync;
      case 'summary-refresh':
        return ABORT_CHANNELS.summaryRefresh;
      default:
        return ABORT_CHANNELS.financialSync;
    }
  }
}
