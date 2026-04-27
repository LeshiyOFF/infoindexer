/**
 * Hook для поллинга статусов батча
 *
 * @remarks
 * Отвечает за периодическое обновление прогресса обработки контактов.
 * Использует useRef для предотвращения race conditions.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthHeaders } from '@/lib/api';
import type { BatchItem, BatchProgress } from '@/contexts/batch.types';

/** Ответ API для отдельного ИНН */
interface BatchItemApiResponse {
  status?: string;
  stage?: string;
  data?: BatchProgress['data'];
  error?: string;
}

/**
 * Хук для поллинга статусов батча
 *
 * @param batchItems - Массив элементов батча
 * @param batchProcessing - Флаг обработки батча
 * @returns Объект с прогрессом и функцией обновления
 */
export function useBatchPolling(
  batchItems: readonly BatchItem[],
  batchProcessing: boolean
) {
  const [batchProgress, setBatchProgress] = useState<Record<string, BatchProgress>>({});
  const pollingInProgressRef = useRef(false);

  /**
   * Запрашивает статусы всех элементов батча
   */
  const pollBatchStatus = useCallback(async () => {
    if (batchItems.length === 0) return;
    if (pollingInProgressRef.current) return;

    pollingInProgressRef.current = true;

    try {
      const results = await Promise.all(
        batchItems.map(async ({ inn }) => {
          try {
            const res = await fetch(`/api/organizations/${inn}/contacts`, {
              headers: getAuthHeaders()
            });

            const json = (await res.json()) as BatchItemApiResponse;

            if (!res.ok) {
              return {
                inn,
                json: {
                  status: 'error' as const,
                  error: json.error ?? `HTTP ${res.status}`
                }
              };
            }

            return {
              inn,
              json: {
                status: (json.status ?? 'idle') as BatchProgress['status'],
                stage: json.stage,
                data: json.data,
                error: json.error
              }
            };
          } catch {
            return { inn, json: { status: 'error' as const, error: 'Сеть' } };
          }
        })
      );

      setBatchProgress(prev => {
        const next = { ...prev };
        results.forEach(({ inn, json }) => {
          next[inn] = {
            status: json.status as BatchProgress['status'],
            stage: json.stage,
            data: json.data,
            error: json.error
          };
        });
        return next;
      });
    } finally {
      pollingInProgressRef.current = false;
    }
  }, [batchItems]);

  /**
   * Эффект для периодического поллинга
   */
  useEffect(() => {
    if (!batchProcessing || batchItems.length === 0) return;

    const interval = setInterval(pollBatchStatus, 3000);
    pollBatchStatus();

    return () => clearInterval(interval);
  }, [batchProcessing, batchItems, pollBatchStatus]);

  /**
   * Эффект для проверки завершения всех задач
   */
  useEffect(() => {
    if (!batchProcessing || batchItems.length === 0) return;

    batchItems.every(b => {
      const p = batchProgress[b.inn];
      return p && (p.status === 'completed' || p.status === 'error');
    });
  }, [batchProcessing, batchItems, batchProgress]);

  return { batchProgress, setBatchProgress };
}

// Re-export типы для удобства импорта
export type { BatchItem, BatchProgress } from '@/contexts/batch.types';
