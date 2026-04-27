/**
 * HTTP Adapter для архива батчей
 *
 * @remarks
 * Реализует IBatchArchivePort через REST API.
 * Hexagonal Architecture: Adapter layer.
 */

"use client";

import { getAuthHeaders } from '@/lib/api';
import type {
  IBatchArchivePort,
  BatchArchiveMeta,
  BatchResults,
  BatchInnItem,
  BatchStatus
} from '../ports';

/**
 * Type guard для BatchInnItem
 */
function isBatchInnItem(item: unknown): item is BatchInnItem {
  return (
    typeof item === 'object' && item !== null &&
    'inn' in item && typeof item.inn === 'string' &&
    'name' in item && typeof item.name === 'string'
  );
}

/**
 * Type guard для BatchStatus
 */
function isBatchStatus(status: string): status is BatchStatus {
  return ['pending', 'running', 'completed', 'error', 'idle'].includes(status);
}

/**
 * HTTP адаптер для архива батчей
 */
export class HttpBatchArchiveAdapter implements IBatchArchivePort {
  /**
   * Загружает метаданные батча
   *
   * @param batchId - ID батча
   * @returns Promise с метаданными
   */
  readonly loadMeta = async (batchId: string): Promise<BatchArchiveMeta> => {
    try {
      const response = await fetch(
        `/api/batches/${batchId}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        console.warn(`[HttpBatchArchiveAdapter] loadMeta HTTP ${response.status}`);
        return {
          inns: [],
          status: 'error',
          totalCount: 0,
          completedCount: 0
        };
      }

      const json = await response.json();

      if (!json || typeof json !== 'object') {
        return { inns: [], status: 'error', totalCount: 0, completedCount: 0 };
      }

      // Валидация inns
      let inns: readonly BatchInnItem[] = [];
      if ('inns' in json && Array.isArray(json.inns)) {
        inns = json.inns.filter(isBatchInnItem);
      }

      // Валидация status
      const status = ('status' in json && typeof json.status === 'string' && isBatchStatus(json.status))
        ? json.status
        : 'idle';

      // Валидация counters
      const totalCount = ('totalCount' in json && typeof json.totalCount === 'number')
        ? json.totalCount
        : 0;
      const completedCount = ('completedCount' in json && typeof json.completedCount === 'number')
        ? json.completedCount
        : 0;

      return { inns, status, totalCount, completedCount };
    } catch (error) {
      console.warn('[HttpBatchArchiveAdapter] loadMeta error:', error);
      return { inns: [], status: 'error', totalCount: 0, completedCount: 0 };
    }
  };

  /**
   * Загружает результаты батча
   *
   * @param batchId - ID батча
   * @returns Promise с результатами
   */
  readonly loadResults = async (batchId: string): Promise<BatchResults> => {
    try {
      const response = await fetch(
        `/api/batches/${batchId}/results`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        console.warn(`[HttpBatchArchiveAdapter] loadResults HTTP ${response.status}`);
        return { results: {} };
      }

      const json = await response.json();

      if (!json || typeof json !== 'object') {
        return { results: {} };
      }

      if ('results' in json && typeof json.results === 'object' && json.results !== null) {
        return { results: json.results as BatchResults['results'] };
      }

      return { results: {} };
    } catch (error) {
      console.warn('[HttpBatchArchiveAdapter] loadResults error:', error);
      return { results: {} };
    }
  };
}
