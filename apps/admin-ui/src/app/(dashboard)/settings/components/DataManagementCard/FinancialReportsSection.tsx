/**
 * Financial Reports Section
 *
 * @remarks
 * Секция управления финансовыми отчётами с прогресс-барами.
 */

"use client";

import { memo } from 'react';
import { Download, Settings2 } from 'lucide-react';
import { LinearProgressIndicator, type ProgressData } from '@/components/ui/LinearProgressIndicator';
import { CancelButton, type CancelButtonState } from '@/components/ui/CancelButton';
import type { YearStatus } from '@/types/settings.types';

const YEARS = Array.from({ length: 14 }, (_, i) => 2011 + i);

interface Props {
  readonly yearStatuses: Readonly<Record<number, YearStatus>>;
  readonly onDownloadClick: () => void;
  readonly onManageClick: () => void;
  readonly onAbortYear?: (year: number) => void;
  readonly getCancelState?: (year: number) => CancelButtonState;
}

/**
 * Преобразует YearStatus в ProgressData
 */
function toProgressData(status: YearStatus, totalRows?: number): ProgressData {
  const rowsProcessed = status.rows_processed ?? 0;

  const progressStatus = status.status === 'running' ? 'running' :
                        status.status === 'deleting' ? 'running' :
                        status.status === 'error' ? 'error' : 'completed';

  return {
    status: progressStatus,
    percentage: status.percentage ?? 0,
    rowsProcessed,
    totalRows,
    message: status.status === 'deleting' ? 'Удаление данных...' : undefined,
    error: status.error
  };
}

/**
 * Возвращает состояние кнопки отмены на основе статуса года
 */
function getCancelButtonState(status: YearStatus, isAborting: boolean): CancelButtonState {
  if (status.status === 'deleting') return 'deleting';
  if (isAborting) return 'stopping';
  return 'idle';
}

export const FinancialReportsSection = memo(function FinancialReportsSection({
  yearStatuses,
  onDownloadClick,
  onManageClick,
  onAbortYear,
  getCancelState
}: Props) {
  // Активные года (running, error или deleting)
  const activeYears = YEARS.filter(year => {
    const status = yearStatuses[year];
    return status && (status.status === 'running' || status.status === 'error' || status.status === 'deleting');
  });

  // Общее количество строк для года (приблизительно из RFSD данных)
  const getEstimatedTotal = (year: number): number => {
    const yearCounts: Record<number, number> = {
      2011: 1_200_000, 2012: 1_500_000, 2013: 1_800_000, 2014: 2_100_000,
      2015: 2_400_000, 2016: 2_700_000, 2017: 3_000_000, 2018: 3_200_000,
      2019: 3_400_000, 2020: 3_100_000, 2021: 3_000_000, 2022: 2_800_000,
      2023: 2_500_000, 2024: 3_170_560
    };
    return yearCounts[year] ?? 3_000_000;
  };

  const handleAbort = (year: number): void => {
    if (onAbortYear) {
      onAbortYear(year);
    }
  };

  const getCancelStateForYear = (year: number): CancelButtonState => {
    if (getCancelState) return getCancelState(year);

    const status = yearStatuses[year];
    if (!status) return 'idle';

    return getCancelButtonState(status, false);
  };

  return (
    <div>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        Финансовые отчёты (ГИР БО)
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Данные финансовой отчётности из russianrap. Выберите года для загрузки.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onDownloadClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Скачать набор
        </button>
        <button
          onClick={onManageClick}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          Управление наборами
        </button>
      </div>

      {activeYears.length > 0 && (
        <div className="mt-4 space-y-3">
          {activeYears.map(year => {
            const status = yearStatuses[year];
            if (!status) return null;

            const progressData = toProgressData(status, getEstimatedTotal(year));
            const canCancel = status.status === 'running' || status.status === 'deleting';
            const cancelState = getCancelStateForYear(year);

            return (
              <div key={year} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700">
                    {year} год
                    {status.status === 'deleting' && (
                      <span className="ml-2 text-orange-600 font-normal">· Удаление...</span>
                    )}
                  </p>
                  {canCancel && (
                    <CancelButton
                      state={cancelState}
                      onCancel={() => handleAbort(year)}
                      variant="compact"
                    />
                  )}
                </div>
                <LinearProgressIndicator data={progressData} variant="detailed" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
