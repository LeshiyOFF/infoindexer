/**
 * HTTP Adapter для истории батчей
 *
 * @remarks
 * Реализует IBatchHistoryPort через REST API.
 * Hexagonal Architecture: Adapter layer.
 */

"use client";

import { getAuthHeaders } from '@/lib/api';
import type {
  IBatchHistoryPort,
  BatchHistoryResponse,
  BatchHistoryItem,
  BatchStatus
} from '../ports';

/**
 * Type guard для проверки ответа API
 */
function isBatchHistoryItem(item: unknown): item is BatchHistoryItem {
  return (
    typeof item === 'object' && item !== null &&
    'batchId' in item && typeof item.batchId === 'string' &&
    'createdAt' in item && typeof item.createdAt === 'number' &&
    'status' in item && typeof item.status === 'string' &&
    'totalCount' in item && typeof item.totalCount === 'number' &&
    'completedCount' in item && typeof item.completedCount === 'number' &&
    'innsCount' in item && typeof item.innsCount === 'number'
  );
}

/**
 * Type guard для проверки BatchStatus
 */
function isBatchStatus(status: string): status is BatchStatus {
  return ['pending', 'running', 'completed', 'error', 'idle'].includes(status);
}

/**
 * HTTP адаптер для истории батчей
 */
export class HttpBatchHistoryAdapter implements IBatchHistoryPort {
  /**
   * Загружает историю батчей с сервера
   *
   * @param page - Номер страницы
   * @param limit - Размер страницы
   * @returns Promise с данными истории
   */
  readonly loadHistory = async (page: number, limit: number): Promise<BatchHistoryResponse> => {
    try {
      const response = await fetch(
        `/api/batches?page=${page}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        console.warn(`[HttpBatchHistoryAdapter] HTTP ${response.status}`);
        return { items: [], total: 0, totalPages: 1 };
      }

      const json = await response.json();

      if (!json || typeof json !== 'object') {
        console.warn('[HttpBatchHistoryAdapter] Invalid response structure');
        return { items: [], total: 0, totalPages: 1 };
      }

      // Валидация items
      let items: readonly BatchHistoryItem[] = [];
      if ('items' in json && Array.isArray(json.items)) {
        items = json.items.filter(isBatchHistoryItem).map((item: BatchHistoryItem) => ({
          ...item,
          status: isBatchStatus(item.status) ? item.status : 'idle'
        }));
      }

      // Валидация total
      const total = ('total' in json && typeof json.total === 'number') ? json.total : 0;

      // Валидация totalPages
      const totalPages = ('totalPages' in json && typeof json.totalPages === 'number')
        ? json.totalPages
        : 1;

      return { items, total, totalPages };
    } catch (error) {
      console.warn('[HttpBatchHistoryAdapter] fetch error:', error);
      return { items: [], total: 0, totalPages: 1 };
    }
  };
}
