/**
 * Domain Service для истории батчей
 *
 * @remarks
 * Содержит бизнес-логику работы с историей батчей.
 * Зависит от Port (IBatchHistoryPort), а не от конкретного адаптера.
 */

import type {
  IBatchHistoryPort,
  BatchHistoryItem,
  BatchStatus
} from '../ports';
import { getProgressPercentage } from '@/lib/batch-status.utils';

/** Результат загрузки истории для UI */
export interface BatchHistoryResult {
  readonly items: readonly BatchHistoryItem[];
  readonly total: number;
  readonly totalPages: number;
  readonly hasRunning: boolean;
}

/**
 * Domain Service для истории батчей
 */
export class BatchHistoryService {
  constructor(private readonly port: IBatchHistoryPort) {}

  /** Загружает историю с расчётом производных полей */
  readonly getHistory = async (page: number, limit: number): Promise<BatchHistoryResult> => {
    const response = await this.port.loadHistory(page, limit);
    const hasRunning = this.hasRunningBatches(response.items);
    return { ...response, hasRunning };
  };

  /** Проверяет наличие выполняющихся батчей */
  readonly hasRunningBatches = (items: readonly BatchHistoryItem[]): boolean => {
    return items.some(item => item.status === 'running');
  };

  /** Проверяет, нужно ли запускать polling */
  readonly shouldPoll = (items: readonly BatchHistoryItem[]): boolean => {
    return items.some(item => item.status === 'running');
  };

  /** Вычисляет процент выполнения для элемента */
  readonly getProgressPercentage = (item: BatchHistoryItem): number => {
    return getProgressPercentage(item.completedCount, item.totalCount);
  };
}
