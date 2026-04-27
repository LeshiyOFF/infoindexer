/**
 * Hook для управления архивом батчей
 *
 * @remarks
 * Orchestrates loading archive data, polling, export, and rerun.
 * Uses BatchArchiveService (Domain layer), not adapters directly.
 * Clean Architecture: Hook → Service → Port → Adapter.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBatchServices } from '@/components/batches/services';
import type {
  BatchArchiveMeta,
  BatchResults,
  BatchInnItem
} from '@/components/batches/ports';

/** Интервал polling для архива (мс) */
const ARCHIVE_POLL_INTERVAL_MS = 3000;

/**
 * Hook для управления архивом батчей
 *
 * @param batchId - ID батча
 * @returns Состояние и методы архива
 */
export function useBatchArchive(batchId: string) {
  // Singleton service instance
  const service = useMemo(() => createBatchServices().archive, []);

  // State
  const [state, setState] = useState<{
    meta: BatchArchiveMeta | null;
    results: BatchResults | null;
    loading: boolean;
  }>(() => ({
    meta: null,
    results: null,
    loading: true
  }));

  /**
   * Загружает данные архива
   */
  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const data = await service.loadBatchData(batchId);
      setState(prev => ({
        ...prev,
        meta: data.meta,
        results: data.results,
        loading: false
      }));
    } catch {
      if (!silent) {
        setState(prev => ({ ...prev, meta: null, results: null, loading: false }));
      }
    }
  }, [service, batchId]);

  /**
   * Экспортирует батч
   */
  const handleExport = useCallback(async () => {
    try {
      await service.exportBatch(batchId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка экспорта';
      alert(message);
      throw error;
    }
  }, [service, batchId]);

  /**
   * Перезапускает батч
   */
  const handleRerun = useCallback(async () => {
    const meta = state.meta;
    if (!meta?.inns.length) {
      throw new Error('Нет ИНН для перезапуска');
    }
    return service.rerunBatch(meta.inns);
  }, [service, state.meta]);

  /**
   * Эффект: загрузка при изменении batchId
   */
  useEffect(() => {
    void loadData();
  }, [loadData]);

  /**
   * Эффект: polling при выполнении
   */
  useEffect(() => {
    const isRunning = state.meta ? service.isRunning(state.meta) : false;
    if (!isRunning) return;

    const interval = setInterval(() => {
      void loadData(true);
    }, ARCHIVE_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [service, state.meta, loadData]);

  return {
    meta: state.meta,
    results: state.results,
    loading: state.loading,
    loadData,
    handleExport,
    handleRerun,
    isRunning: state.meta ? service.isRunning(state.meta) : false
  };
}
