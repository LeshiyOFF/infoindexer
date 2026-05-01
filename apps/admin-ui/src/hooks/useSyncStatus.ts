/**
 * Hook для polling статусов синхронизации
 *
 * @remarks
 * Отвечает за загрузку статистики, статусов синхронизации и периодическое обновление.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuthHeaders } from '@/lib/api';
import type {
  Stats,
  SyncStatuses,
  YearStatus,
  EgrulStatus,
  SanctionsStatus,
  RefreshSummaryStatus
} from '@/types/settings.types';

const YEARS = Array.from({ length: 14 }, (_, i) => 2011 + i);
const POLL_INTERVAL_MS = 10000;

/**
 * Хук для управления статусами синхронизации
 */
export function useSyncStatus() {
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    companiesGirBo: 0,
    companiesEgrul: 0,
    redisMemory: '0B'
  });

  const [statuses, setStatuses] = useState<SyncStatuses>({});

  /**
   * Загружает статистику системы
   */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats', { headers: getAuthHeaders() });
      const data = await res.json();
      if (!data.error) {
        setStats({
          totalRecords: data.totalRecords ?? 0,
          companiesGirBo: data.companiesGirBo ?? 0,
          companiesEgrul: data.companiesEgrul ?? 0,
          redisMemory: data.redisMemory ?? '0B'
        });
      }
    } catch (e) {
      console.warn('Settings: fetchStats error', e);
    }
  }, []);

  /**
   * Загружает статусы всех синхронизаций
   */
  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/status', { headers: getAuthHeaders() });
      const data = await res.json();
      if (!data.error) {
        setStatuses(data);
      }

      try {
        const sanctionsRes = await fetch('/api/sync/sanctions', { headers: getAuthHeaders() });
        const sanctionsData = await sanctionsRes.json();
        if (!sanctionsData.error) {
          setStatuses(prev => ({ ...prev, sanctions: sanctionsData }));
        }
      } catch {
        // Игнорируем ошибки санкций
      }
    } catch (e) {
      console.warn('Settings: fetchStatuses error', e);
    }
  }, []);

  /**
   * Обновляет кэш поиска
   */
  const refreshSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/refresh-summary', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        alert('Ошибка авторизации. Проверьте пароль.');
        return;
      }

      await res.json();

      if (res.status === 400 || res.ok) {
        await fetchStatuses();
      }
    } catch {
      await fetchStatuses();
    }
  }, [fetchStatuses]);

  /**
   * Периодически обновляет данные
   * Останавливает polling когда вкладка скрыта (Page Visibility API)
   */
  useEffect(() => {
    void fetchStats();
    void fetchStatuses();

    const interval = setInterval(() => {
      // Polling только когда вкладка видима
      if (document.visibilityState === 'visible') {
        void fetchStats();
        void fetchStatuses();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchStats, fetchStatuses]);

  /**
   * Вычисляемые значения для UI
   */
  const yearStatuses = useMemo<Record<number, YearStatus>>(
    () =>
      Object.fromEntries(
        YEARS.map(y => [y, (statuses[y] as YearStatus) ?? { status: 'idle', percentage: 0 }])
      ) as Record<number, YearStatus>,
    [statuses]
  );

  const egrulStatus = useMemo<EgrulStatus>(
    () => (statuses['egrul'] as EgrulStatus) ?? { status: 'idle' },
    [statuses]
  );

  const sanctionsStatus = useMemo<SanctionsStatus>(
    () => (statuses['sanctions'] as SanctionsStatus) ?? { status: 'idle' },
    [statuses]
  );

  const summaryStatus = useMemo<RefreshSummaryStatus | undefined>(
    () => statuses['refresh_summary'] as RefreshSummaryStatus | undefined,
    [statuses]
  );

  const anySyncRunning = useMemo(
    () =>
      egrulStatus.status === 'running' ||
      sanctionsStatus.status === 'running' ||
      summaryStatus?.status === 'running' ||
      YEARS.some(y => (statuses[y] as YearStatus)?.status === 'running'),
    [egrulStatus, sanctionsStatus, summaryStatus, statuses]
  );

  return {
    stats,
    statuses,
    yearStatuses,
    egrulStatus,
    sanctionsStatus,
    summaryStatus,
    anySyncRunning,
    fetchStats,
    fetchStatuses,
    refreshSummary
  };
}
