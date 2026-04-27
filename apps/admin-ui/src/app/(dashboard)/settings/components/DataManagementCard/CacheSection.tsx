/**
 * Cache Section
 *
 * @remarks
 * Секция управления кэшем с прогресс-баром.
 */

"use client";

import { memo } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { LinearProgressIndicator, type ProgressData } from '@/components/ui/LinearProgressIndicator';
import { CancelButton, type CancelButtonState } from '@/components/ui/CancelButton';
import type { RefreshSummaryStatus } from '@/types/settings.types';

interface Props {
  readonly summaryStatus: RefreshSummaryStatus | undefined;
  readonly anySyncRunning: boolean;
  readonly formatLastSync: (iso?: string) => string | null;
  readonly onRefresh: () => void;
  readonly onAbort?: () => void;
  readonly getCancelState?: () => CancelButtonState;
}

/**
 * Преобразует RefreshSummaryStatus в ProgressData
 */
function toProgressData(status: RefreshSummaryStatus | undefined): ProgressData {
  if (!status) {
    return {
      status: 'idle',
      percentage: 0
    };
  }

  return {
    status: status.status === 'running' ? 'running' :
            status.status === 'deleting' ? 'running' :
            status.status === 'error' ? 'error' : 'completed',
    percentage: status.percentage ?? 0,
    rowsProcessed: status.rows ?? undefined,
    message: status.status === 'deleting' ? 'Удаление...' : status.message ?? undefined,
    error: status.error ?? undefined
  };
}

export const CacheSection = memo(function CacheSection({
  summaryStatus,
  anySyncRunning,
  formatLastSync,
  onRefresh,
  onAbort,
  getCancelState
}: Props) {
  const isRunning = summaryStatus?.status === 'running' || summaryStatus?.status === 'deleting';
  const progressData = toProgressData(summaryStatus);

  const cancelState = getCancelState ? getCancelState() : 'idle';
  const canCancel = isRunning;

  return (
    <div>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        Кэш для поиска
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Агрегированный кэш для быстрого поиска. Обновите после загрузки новых данных.
      </p>
      <button
        onClick={onRefresh}
        disabled={anySyncRunning}
        className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isRunning ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        Обновить кэш
      </button>

      {isRunning && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {summaryStatus?.status === 'deleting' ? 'Удаление...' : 'Пересчёт...'}
            </span>
            {canCancel && onAbort && (
              <CancelButton
                state={cancelState}
                onCancel={onAbort}
                variant="compact"
              />
            )}
          </div>
          <LinearProgressIndicator data={progressData} />
        </div>
      )}

      {summaryStatus && summaryStatus.status !== 'running' && (
        <div className="mt-2 text-xs text-gray-600">
          {summaryStatus.status === 'error' && (
            <span className="text-red-600">Ошибка: {summaryStatus.error ?? ''}</span>
          )}
          {summaryStatus.status === 'completed' && (
            <>
              {summaryStatus.rows != null && <span>Готово: {summaryStatus.rows.toLocaleString()} строк</span>}
              {summaryStatus.elapsedMs != null && <span> · Время: {(summaryStatus.elapsedMs / 1000).toFixed(1)} с</span>}
              {summaryStatus.completed_at && <span> · {formatLastSync(summaryStatus.completed_at)}</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
});
