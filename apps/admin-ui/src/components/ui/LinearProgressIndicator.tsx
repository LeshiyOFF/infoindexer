/**
 * Линейный индикатор прогресса в стиле Apple
 *
 * @remarks
 * Минималистичный прогресс-бар с shimmer-анимацией.
 * Следует Apple HIG: тонкий (4px), скруглённый, плавный.
 *
 * Shimmer показывается при status='running' или 'stopping'.
 * Indeterminate анимация при status='stopping' или 'deleting'.
 */

"use client";

import { memo } from 'react';

// Реэкспорт типов для обратной совместимости
export type {
  ProgressStatus,
  ProgressData,
  LinearProgressIndicatorProps
} from './LinearProgressIndicator.types';

import type {
  ProgressStatus,
  ProgressData,
  LinearProgressIndicatorProps
} from './LinearProgressIndicator.types';
import {
  formatRows,
  formatEta,
  calculatePercentage,
  getBarColorClass,
  shouldShowShimmer,
  isIndeterminate
} from './LinearProgressIndicator.utils';

/**
 * Получает текст деталей для статуса
 */
function getDetails(data: ProgressData): string | null {
  const { status, error, completedAt, totalRows, rowsProcessed, speed, eta, message, indeterminate } = data;

  if (error) {
    return `Ошибка: ${error}`;
  }

  if (status === 'completed') {
    if (completedAt) {
      const date = new Date(completedAt);
      const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      if (totalRows) {
        return `Готово: ${formatRows(totalRows)} строк · ${time}`;
      }
      return `Завершено · ${time}`;
    }
    if (totalRows) {
      return `Готово: ${formatRows(totalRows)} строк`;
    }
    return 'Завершено';
  }

  if (status === 'running' || status === 'stopping') {
    // Indeterminate режим - показываем только сообщение, без строк и скорости
    if (indeterminate) {
      return message || 'Загрузка...';
    }

    const parts: string[] = [];

    if (rowsProcessed !== undefined && totalRows !== undefined) {
      parts.push(`${formatRows(rowsProcessed)} / ${formatRows(totalRows)} строк`);
    } else if (rowsProcessed !== undefined) {
      parts.push(`${formatRows(rowsProcessed)} строк`);
    } else if (totalRows !== undefined) {
      parts.push(`из ${formatRows(totalRows)} строк`);
    }

    if (speed !== undefined && speed > 0) {
      parts.push(`~${speed.toLocaleString('ru-RU')}/сек`);
    }

    if (eta !== undefined && eta > 0) {
      parts.push(formatEta(eta));
    } else if (message) {
      parts.push(message);
    } else if (parts.length === 0) {
      parts.push('Загрузка...');
    }

    return parts.join(' · ');
  }

  if (message) {
    return message;
  }

  return null;
}

/**
 * Линейный индикатор прогресса в стиле Apple
 */
export const LinearProgressIndicator = memo(function LinearProgressIndicator({
  data,
  variant = 'detailed',
  showPercentage = true,
  className = ''
}: LinearProgressIndicatorProps) {
  const {
    status,
    percentage,
    rowsProcessed,
    totalRows,
    indeterminate: indeterminateFlag
  } = data;

  // Определяем отображаемый процент
  const displayPercentage = percentage ?? calculatePercentage(rowsProcessed ?? 0, totalRows ?? 0);
  const textPercentage = Math.round(displayPercentage);

  // Indeterminate состояние: stopping/deleting или флаг indeterminate=true
  const showIndeterminate = isIndeterminate(status) || indeterminateFlag;

  // Shimmer для running/stopping
  const showShimmer = shouldShowShimmer(status, displayPercentage);
  const barColor = getBarColorClass(status);

  // Текст деталей
  const details = getDetails(data);

  return (
    <div className={`w-full ${className}`}>
      {/* Прогресс-бар */}
      <div
        className="h-1 w-full bg-gray-200 rounded-full overflow-hidden relative"
        role="progressbar"
        aria-valuenow={showIndeterminate ? undefined : displayPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={details ?? `Прогресс: ${displayPercentage}%`}
        aria-busy={showIndeterminate ? 'true' : 'false'}
      >
        {showIndeterminate ? (
          /* Indeterminate: чёрный бегунок движется слева направо */
          <div
            className="h-full bg-black rounded-full absolute top-0"
            style={{
              width: '30%',
              left: '-35%',
              animation: 'indeterminate 1.5s ease-in-out infinite'
            }}
          />
        ) : (
          /* Normal: прогресс с shimmer overlay */
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-300 ease-out will-change-[width] relative`}
            style={{ width: `${displayPercentage}%` }}
          >
            {showShimmer && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite'
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Детали */}
      {(details !== null || (showPercentage && !showIndeterminate)) && (
        <div className="flex items-center justify-between mt-2">
          {details !== null && (
            <span className="text-[10px] text-gray-600 font-medium truncate">
              {details}
            </span>
          )}
          {showPercentage && !showIndeterminate && !details && (
            <span className="text-[10px] text-gray-600 font-medium">
              {textPercentage}%
            </span>
          )}
          {showPercentage && !showIndeterminate && details && (
            <span className="text-[10px] text-gray-600 font-medium ml-2 shrink-0">
              {textPercentage}%
            </span>
          )}
        </div>
      )}
    </div>
  );
});
