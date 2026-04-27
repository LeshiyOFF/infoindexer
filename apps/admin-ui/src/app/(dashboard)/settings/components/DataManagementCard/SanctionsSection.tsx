/**
 * Sanctions Section
 *
 * @remarks
 * Секция управления санкциями с прогресс-баром.
 */

"use client";

import { memo } from 'react';
import { RefreshCw } from 'lucide-react';
import { LinearProgressIndicator, type ProgressData } from '@/components/ui/LinearProgressIndicator';
import { CancelButton, type CancelButtonState } from '@/components/ui/CancelButton';
import type { SanctionsStatus } from '@/types/settings.types';

// Примерное общее количество записей в OpenSanctions
const ESTIMATED_SANCTIONS_TOTAL = 2_000_000;

interface Props {
  readonly sanctionsStatus: SanctionsStatus;
  readonly formatLastSync: (iso?: string) => string | null;
  readonly onSync: () => void;
  readonly onAbort?: () => void;
  readonly getCancelState?: () => CancelButtonState;
}

/**
 * Преобразует SanctionsStatus в ProgressData
 */
function toProgressData(status: SanctionsStatus): ProgressData {
  return {
    status: status.status === 'running' ? 'running' :
            status.status === 'deleting' ? 'running' :
            status.status === 'error' ? 'error' : 'completed',
    percentage: status.percentage ?? 0,
    totalRows: ESTIMATED_SANCTIONS_TOTAL,
    message: status.status === 'deleting' ? 'Удаление данных...' : status.message ?? undefined,
    error: status.error ?? undefined
  };
}

export const SanctionsSection = memo(function SanctionsSection({
  sanctionsStatus,
  formatLastSync,
  onSync,
  onAbort,
  getCancelState
}: Props) {
  const isRunning = sanctionsStatus.status === 'running' || sanctionsStatus.status === 'deleting';
  const progressData = toProgressData(sanctionsStatus);

  const cancelState = getCancelState ? getCancelState() : 'idle';
  const canCancel = isRunning;

  return (
    <div>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        Санкции (OpenSanctions)
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Данные о санкционных программах из OpenSanctions.
      </p>
      <button
        onClick={onSync}
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isRunning ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Обновить санкции
      </button>

      {isRunning && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {sanctionsStatus.status === 'deleting' ? 'Удаление...' : 'Идёт загрузка...'}
            </span>
            {canCancel && onAbort && (
              <CancelButton
                state={cancelState}
                onCancel={onAbort}
                variant="compact"
              />
            )}
          </div>
          <LinearProgressIndicator data={progressData} variant="detailed" />
        </div>
      )}

      {sanctionsStatus.status === 'error' && sanctionsStatus.error && (
        <p className="text-xs text-red-600 mt-2">
          Ошибка: {sanctionsStatus.error}
        </p>
      )}

      {sanctionsStatus.completed_at && !isRunning && (
        <p className="text-xs text-gray-500 mt-2">
          Последняя синхронизация: {formatLastSync(sanctionsStatus.completed_at) ?? '—'}
        </p>
      )}
    </div>
  );
});
