/**
 * Adapter для очереди задач
 *
 * @remarks
 * Реализует Port IQueueService для управления очередью обработки.
 * Поддерживает ограничение concurrency для параллельной обработки.
 */

import { redisClient } from 'shared';
import { BATCH_TTL_SEC, PARSE_CONCURRENCY } from '../constants';
import type { QueuedTask } from '../types/contacts.types';
import type { IQueueService } from '../ports/i-queue.port';
import type { IEnrichmentService } from '../ports/i-enrichment.port';

/**
 * Сервис для управления очередью задач
 *
 * @remarks
 * Реализует очередь с ограничением количества параллельных задач.
 */
export class QueueService implements IQueueService {
  private readonly queue: QueuedTask[] = [];
  private inFlight = 0;

  constructor(private readonly enrichment: IEnrichmentService) {}

  /**
   * Добавляет задачу в очередь
   *
   * @param inn - ИНН организации
   * @param batchId - Опциональный ID батча
   */
  enqueue(inn: string, batchId?: string): void {
    this.queue.push({ inn, batchId });
    this.processNext();
  }

  /**
   * Обрабатывает следующую задачу из очереди
   */
  processNext(): void {
    if (this.inFlight >= PARSE_CONCURRENCY || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) {
      return;
    }

    this.inFlight++;
    this.enrichment.getEnrichedData(task.inn, task.batchId)
      .catch((e: Error) => {
        console.error(`[Waterfall] Queue error ${task.inn}:`, e);
        this.handleTaskError(task, e);
      })
      .finally(() => {
        this.inFlight--;
        this.processNext();
      });
  }

  /**
   * Возвращает текущий размер очереди
   *
   * @returns Количество задач в очереди
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Возвращает количество выполняющихся задач
   *
   * @returns Количество задач в обработке
   */
  getInFlightCount(): number {
    return this.inFlight;
  }

  /**
   * Обрабатывает ошибку выполнения задачи
   *
   * @param task - Задача с ошибкой
   * @param error - Ошибка
   */
  private handleTaskError(task: QueuedTask, error: Error): void {
    redisClient.hset(`contacts:status:${task.inn}`, {
      status: 'error',
      error: String(error)
    }).catch(() => {
      // Игнорируем ошибки при записи статуса
    });

    if (task.batchId) {
      redisClient.hset(`batch:${task.batchId}:inn_status`, task.inn, 'error').catch(() => {
        // Игнорируем ошибки при записи статуса
      });
      redisClient.expire(`batch:${task.batchId}:inn_status`, BATCH_TTL_SEC).catch(() => {
        // Игнорируем ошибки при установке TTL
      });
    }
  }
}
