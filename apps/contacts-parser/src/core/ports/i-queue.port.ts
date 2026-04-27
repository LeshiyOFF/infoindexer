/**
 * Port для очереди задач
 *
 * @remarks
 * Определяет контракт для управления очередью обработки ИНН.
 * Реализует Dependency Inversion Principle из SOLID.
 */

import type { QueuedTask } from '../types/contacts.types';

/**
 * Port для очереди задач
 *
 * @remarks
 * Определяет методы для управления очередью с ограничением concurrency.
 */
export interface IQueueService {
  /**
   * Добавляет задачу в очередь
   *
   * @param inn - ИНН организации
   * @param batchId - Опциональный ID батча
   */
  enqueue(inn: string, batchId?: string): void;

  /**
   * Обрабатывает следующую задачу из очереди
   */
  processNext(): void;

  /**
   * Возвращает текущий размер очереди
   *
   * @returns Количество задач в очереди
   */
  getQueueSize(): number;

  /**
   * Возвращает количество выполняющихся задач
   *
   * @returns Количество задач в обработке
   */
  getInFlightCount(): number;
}
