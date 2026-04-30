/**
 * Settings Page
 */

"use client";

import { useState, useCallback, useEffect } from 'react';
import { getAuthHeaders } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { DataManagementCard } from './components/DataManagementCard';
import { StatsCard } from './components/StatsCard';
import { ManageDatasetsModal } from './components/ManageDatasetsModal';
import { EgrulManageModal } from './components/EgrulManageModal';
import { DownloadDatasetsModal } from './components/DownloadDatasetsModal';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useModalState } from '@/hooks/useModalState';
import type { CancelButtonState } from '@/components/ui/CancelButton';
import type { YearStatus } from '@/types/settings.types';

const YEARS = Array.from({ length: 14 }, (_, i) => 2011 + i);

export default function SettingsPage() {
  const {
    stats,
    yearStatuses,
    egrulStatus,
    sanctionsStatus,
    summaryStatus,
    anySyncRunning,
    fetchStatuses,
    fetchStats,
    refreshSummary
  } = useSyncStatus();

  const {
    downloadOpen,
    manageOpen,
    egrulManageOpen,
    openDownload,
    closeDownload,
    openManage,
    closeManage,
    openEgrulManage,
    closeEgrulManage
  } = useModalState();

  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [selectedYearsToDelete, setSelectedYearsToDelete] = useState<Set<number>>(new Set());
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Abort state
  const [abortingYears, setAbortingYears] = useState<Set<number>>(new Set());
  const [isAbortingEgrul, setIsAbortingEgrul] = useState(false);
  const [isAbortingSanctions, setIsAbortingSanctions] = useState(false);
  const [isAbortingSummary, setIsAbortingSummary] = useState(false);

  const handleResponse = async (res: Response): Promise<boolean> => {
    if (!res.ok) {
      let errorMessage = `Ошибка сервера: ${res.status}`;

      try {
        const data = await res.json();
        errorMessage = data.error || errorMessage;
      } catch {
        if (res.status === 401) {
          errorMessage = 'Ошибка авторизации. Проверьте пароль.';
        } else if (res.status === 503) {
          errorMessage = 'Сервис недоступен. Worker может быть не запущен.';
        }
      }

      alert(errorMessage);
      return false;
    }
    return true;
  };

  const startEgrulSync = async (): Promise<void> => {
    const res = await fetch('/api/sync/egrul/start', { method: 'POST', headers: getAuthHeaders() });
    if (await handleResponse(res)) await fetchStatuses();
  };

  const startSanctionsSync = async (): Promise<void> => {
    const res = await fetch('/api/sync/sanctions/start', { method: 'POST', headers: getAuthHeaders() });
    if (await handleResponse(res)) await fetchStatuses();
  };

  const toggleYear = (year: number): void => {
    setSelectedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year); else next.add(year);
      return next;
    });
  };

  const toggleYearToDelete = (year: number): void => {
    setSelectedYearsToDelete(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year); else next.add(year);
      return next;
    });
  };

  const startDownloadSelected = async (): Promise<void> => {
    if (selectedYears.size === 0) return;
    setDownloadInProgress(true);
    const years = Array.from(selectedYears).sort((a, b) => a - b);
    for (const year of years) {
      const res = await fetch('/api/sync/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ year })
      });
      if (!(await handleResponse(res))) break;
    }
    setDownloadInProgress(false);
    closeDownload();
    setSelectedYears(new Set());
    await fetchStatuses();
    await fetchStats();
  };

  const deleteSelectedYears = async (): Promise<void> => {
    if (selectedYearsToDelete.size === 0) return;
    const yearsStr = Array.from(selectedYearsToDelete).sort((a, b) => a - b).join(', ');
    if (!confirm(`Удалить данные за ${yearsStr}?`)) return;
    setDeleteInProgress(true);
    const years = Array.from(selectedYearsToDelete).sort((a, b) => a - b);
    for (const year of years) {
      const res = await fetch('/api/sync/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ year })
      });
      if (!(await handleResponse(res))) break;
    }
    setDeleteInProgress(false);
    closeManage();
    setSelectedYearsToDelete(new Set());
    await fetchStatuses();
    await fetchStats();
  };

  // Abort handlers
  const handleAbortYear = useCallback(async (year: number): Promise<void> => {
    setAbortingYears(prev => new Set(prev).add(year));
    const res = await fetch('/api/sync/abort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ year })
    });
    if (await handleResponse(res)) {
      await fetchStatuses();
    }
    // Note: isAbortingYear сбрасывается через useEffect когда статус становится 'idle'
  }, []);

  const handleAbortEgrul = useCallback(async (): Promise<void> => {
    setIsAbortingEgrul(true);
    const res = await fetch('/api/sync/egrul/abort', { method: 'POST', headers: getAuthHeaders() });
    if (await handleResponse(res)) {
      await fetchStatuses();
    }
    // Note: isAbortingEgrul сбрасывается через useEffect когда статус становится 'idle'
  }, []);

  const handleAbortSanctions = useCallback(async (): Promise<void> => {
    setIsAbortingSanctions(true);
    const res = await fetch('/api/sync/sanctions/abort', { method: 'POST', headers: getAuthHeaders() });
    if (await handleResponse(res)) {
      await fetchStatuses();
    }
    // Note: isAbortingSanctions сбрасывается через useEffect когда статус становится 'idle'
  }, []);

  const handleAbortSummary = useCallback(async (): Promise<void> => {
    setIsAbortingSummary(true);
    const res = await fetch('/api/refresh-summary/abort', { method: 'POST', headers: getAuthHeaders() });
    if (await handleResponse(res)) {
      await fetchStatuses();
    }
    // Note: isAbortingSummary сбрасывается через useEffect когда статус становится 'idle'
  }, []);

  // Сбрасываем aborting states когда статусы становятся 'idle'/'completed'/'error'
  useEffect(() => {
    // Обрабатываем abortingYears
    const yearsToReset = Array.from(abortingYears).filter(year => {
      const status = yearStatuses[year] as YearStatus;
      return status && (status.status === 'idle' || status.status === 'completed' || status.status === 'error');
    });

    if (yearsToReset.length > 0) {
      setAbortingYears(prev => {
        const next = new Set(prev);
        for (const year of yearsToReset) {
          next.delete(year);
        }
        return next;
      });
    }

    // Обрабатываем isAbortingEgrul
    if (isAbortingEgrul && egrulStatus) {
      if (egrulStatus.status === 'idle' || egrulStatus.status === 'completed' || egrulStatus.status === 'error') {
        setIsAbortingEgrul(false);
      }
    }

    // Обрабатываем isAbortingSanctions
    if (isAbortingSanctions && sanctionsStatus) {
      if (sanctionsStatus.status === 'idle' || sanctionsStatus.status === 'completed' || sanctionsStatus.status === 'error') {
        setIsAbortingSanctions(false);
      }
    }

    // Обрабатываем isAbortingSummary
    if (isAbortingSummary && summaryStatus) {
      if (summaryStatus.status === 'idle' || summaryStatus.status === 'completed' || summaryStatus.status === 'error') {
        setIsAbortingSummary(false);
      }
    }
  }, [yearStatuses, egrulStatus, sanctionsStatus, summaryStatus, abortingYears, isAbortingEgrul, isAbortingSanctions, isAbortingSummary]);

  const isAbortingYear = (year: number): boolean => abortingYears.has(year);

  // Cancel state providers для кнопок отмены
  const getYearCancelState = useCallback((year: number): CancelButtonState => {
    const status = yearStatuses[year] as YearStatus;
    if (!status) return 'idle';
    if (status.status === 'deleting') return 'deleting';
    // Показываем 'stopping' при aborting или если isAbortingYear=true
    if (status.status === 'aborting' || (isAbortingYear(year) && status.status === 'running')) {
      return 'stopping';
    }
    return 'idle';
  }, [yearStatuses, abortingYears]);

  const getEgrulCancelState = useCallback((): CancelButtonState => {
    if (!egrulStatus) return 'idle';
    if (egrulStatus.status === 'deleting') return 'deleting';
    if (egrulStatus.status === 'aborting' || (isAbortingEgrul && egrulStatus.status === 'running')) {
      return 'stopping';
    }
    return 'idle';
  }, [egrulStatus, isAbortingEgrul]);

  const getSanctionsCancelState = useCallback((): CancelButtonState => {
    if (!sanctionsStatus) return 'idle';
    if (sanctionsStatus.status === 'deleting') return 'deleting';
    if (sanctionsStatus.status === 'aborting' || (isAbortingSanctions && sanctionsStatus.status === 'running')) {
      return 'stopping';
    }
    return 'idle';
  }, [sanctionsStatus, isAbortingSanctions]);

  const getSummaryCancelState = useCallback((): CancelButtonState => {
    if (!summaryStatus) return 'idle';
    if (summaryStatus.status === 'deleting') return 'deleting';
    if (summaryStatus.status === 'aborting' || (isAbortingSummary && summaryStatus.status === 'running')) {
      return 'stopping';
    }
    return 'idle';
  }, [summaryStatus, isAbortingSummary]);

  const notDownloadedYears = YEARS.filter(y => (yearStatuses[y] as YearStatus)?.status !== 'completed');
  const yearsForDeletion = YEARS.filter(y => {
    const status = yearStatuses[y] as YearStatus;
    return status?.status === 'completed' || status?.status === 'running';
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Параметры системы</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <DataManagementCard
          yearStatuses={yearStatuses}
          egrulStatus={egrulStatus}
          sanctionsStatus={sanctionsStatus}
          summaryStatus={summaryStatus}
          anySyncRunning={anySyncRunning}
          formatLastSync={formatDate}
          onDownloadClick={() => { setSelectedYears(new Set()); openDownload(); }}
          onManageClick={() => { setSelectedYearsToDelete(new Set()); openManage(); }}
          onEgrulSync={startEgrulSync}
          onSanctionsSync={startSanctionsSync}
          onEgrulManageClick={openEgrulManage}
          onRefreshSummary={refreshSummary}
          onAbortYear={handleAbortYear}
          onAbortEgrul={handleAbortEgrul}
          onAbortSanctions={handleAbortSanctions}
          onAbortSummary={handleAbortSummary}
          getYearCancelState={getYearCancelState}
          getEgrulCancelState={getEgrulCancelState}
          getSanctionsCancelState={getSanctionsCancelState}
          getSummaryCancelState={getSummaryCancelState}
        />
        <StatsCard stats={stats} />
      </div>

      <ManageDatasetsModal
        open={manageOpen}
        onClose={() => !deleteInProgress && closeManage()}
        yearsForDeletion={yearsForDeletion}
        selectedYearsToDelete={selectedYearsToDelete}
        onToggleYear={toggleYearToDelete}
        deleteInProgress={deleteInProgress}
        onDelete={deleteSelectedYears}
      />

      <EgrulManageModal
        open={egrulManageOpen}
        onClose={closeEgrulManage}
        egrulStatus={egrulStatus}
        onSync={startEgrulSync}
        onFetch={async () => { await fetchStats(); await fetchStatuses(); }}
      />

      <DownloadDatasetsModal
        open={downloadOpen}
        onClose={() => !downloadInProgress && closeDownload()}
        notDownloadedYears={notDownloadedYears}
        selectedYears={selectedYears}
        onToggleYear={toggleYear}
        onSelectAll={() => setSelectedYears(new Set(notDownloadedYears))}
        onClearSelection={() => setSelectedYears(new Set())}
        downloadInProgress={downloadInProgress}
        onDownload={startDownloadSelected}
      />
    </div>
  );
}
