/**
 * EGRUL Section
 *
 * @remarks
 * Секция управления ЕГРЮЛ с прогресс-баром.
 */

"use client";

import { memo } from 'react';
import { RefreshCw, Settings2 } from 'lucide-react';
import { LinearProgressIndicator, type ProgressData } from '@/components/ui/LinearProgressIndicator';
import { CancelButton, type CancelButtonState } from '@/components/ui/CancelButton';
import type { EgrulStatus } from '@/types/settings.types';

// Примерное общее количество строк в ЕГРЮЛ
const ESTIMATED_EGRUL_TOTAL = 20_000_000;

interface Props {
  readonly egrulStatus: EgrulStatus;
  readonly anySyncRunning: boolean;
  readonly formatLastSync: (iso?: string) => string | null;
  readonly onSync: () => void;
  readonly onManageClick: () => void;
  readonly onAbort?: () => void;
  readonly getCancelState?: () => CancelButtonState;
}

/**
 * Преобразует EgrulStatus в ProgressData
 */
function toProgressData(status: EgrulStatus): ProgressData {
  return {
    status: status.status === 'running' ? 'running' :
            status.status === 'deleting' ? 'running' :
            status.status === 'error' ? 'error' : 'completed',
    percentage: undefined,  // Всегда undefined - без процентов
    rowsProcessed: undefined,  // Не показываем количество строк
    totalRows: undefined,  // Не показываем "X / Y строк"
    indeterminate: (status.status === 'running' || status.status === 'deleting'),  // Всегда indeterminate при загрузке
    message: status.status === 'deleting' ? 'Удаление данных...' : status.message ?? undefined,
    error: status.error ?? undefined
  };
}

export const EgrulSection = memo(function EgrulSection({
  egrulStatus,
  formatLastSync,
  onSync,
  onManageClick,
  onAbort,
  getCancelState
}: Props) {
  // isRunning - для отключения кнопки (кнопка активна при ошибке)
  const isRunning = egrulStatus.status === 'running' || egrulStatus.status === 'deleting';
  const hasError = egrulStatus.status === 'error';
  // showProgress - для отображения прогрессбара (показывается при ошибке)
  const showProgress = isRunning || hasError;
  const progressData = toProgressData(egrulStatus);

  const cancelState = getCancelState ? getCancelState() : 'idle';
  const canCancel = isRunning;  // Отмена только во время выполнения

  return (
    <div>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        Реестр Юрлиц (ЕГРЮЛ)
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Названия, адреса, директора из ФНС. Полная перезагрузка данных.
      </p>
      <div className="flex gap-2">
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
          Обновить ЕГРЮЛ
        </button>
        <button
          onClick={onManageClick}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          Управление
        </button>
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className={hasError ? 'text-xs text-red-600 font-semibold' : 'text-xs text-gray-500'}>
              {hasError ? 'Ошибка при загрузке' : egrulStatus.status === 'deleting' ? 'Удаление...' : 'Идёт загрузка...'}
            </span>
            {canCancel && onAbort && !hasError && (
              <CancelButton
                state={cancelState}
                onCancel={onAbort}
                variant="compact"
              />
            )}
          </div>
          <LinearProgressIndicator data={progressData} variant="detailed" />
          {hasError && egrulStatus.error && (
            <p className="text-xs text-red-500 mt-1">{egrulStatus.error}</p>
          )}
        </div>
      )}

      {egrulStatus.completed_at && !showProgress && (
        <p className="text-xs text-gray-500 mt-2">
          Последняя синхронизация: {formatLastSync(egrulStatus.completed_at) ?? '—'}
        </p>
      )}
    </div>
  );
});
