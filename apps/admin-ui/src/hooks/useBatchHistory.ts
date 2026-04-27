/**
 * Hook для управления историей батчей
 *
 * @remarks
 * Orchestrates loading history, pagination, and polling.
 * Uses BatchHistoryService (Domain layer), not adapters directly.
 * Clean Architecture: Hook → Service → Port → Adapter.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBatchServices } from '@/components/batches/services';
import type { BatchHistoryItem } from '@/components/batches/ports';
import type { BatchHistoryResult } from '@/components/batches/services/batch-history.service';

/** Интервал polling для истории (мс) */
const HISTORY_POLL_INTERVAL_MS = 2000;

/**
 * Hook для управления историей батчей
 *
 * @param refreshTrigger - Триггер для принудительного обновления
 * @returns Состояние и методы истории
 */
export function useBatchHistory(refreshTrigger?: number) {
  // Singleton service instance
  const service = useMemo(() => createBatchServices().history, []);

  // State
  const [state, setState] = useState<{
    items: readonly BatchHistoryItem[];
    loading: boolean;
    page: number;
    total: number;
    totalPages: number;
  }>(() => ({
    items: [],
    loading: true,
    page: 1,
    total: 0,
    totalPages: 1
  }));

  /**
   * Загружает историю
   */
  const loadHistory = useCallback(async (pageNum: number, silent = false) => {
    if (!silent) {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const result: BatchHistoryResult = await service.getHistory(pageNum, 20);

      setState(prev => ({
        ...prev,
        items: result.items,
        total: result.total,
        totalPages: result.totalPages,
        loading: false
      }));
    } catch {
      if (!silent) {
        setState(prev => ({ ...prev, items: [], loading: false }));
      }
    }
  }, [service]);

  /**
   * Изменяет страницу
   */
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  /**
   * Эффект: загрузка при изменении страницы или триггера
   */
  useEffect(() => {
    void loadHistory(state.page);
  }, [loadHistory, state.page, refreshTrigger]);

  /**
   * Эффект: polling при наличии выполняющихся батчей
   */
  useEffect(() => {
    const hasRunning = service.shouldPoll(state.items);
    if (!hasRunning) return;

    const interval = setInterval(() => {
      void loadHistory(state.page, true);
    }, HISTORY_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [service, state.items, state.page, loadHistory]);

  return {
    items: state.items,
    loading: state.loading,
    page: state.page,
    total: state.total,
    totalPages: state.totalPages,
    loadHistory,
    setPage
  };
}
