/**
 * Progress Bar для батча
 *
 * @remarks
 * Переиспользуемый компонент для отображения прогресса.
 */

"use client";

import { memo } from 'react';
import { getProgressPercentage } from '@/lib/batch-status.utils';

export interface BatchProgressBarProps {
  readonly completed: number;
  readonly total: number;
  readonly showLabel?: boolean;
  readonly className?: string;
  readonly barClassName?: string;
}

export const BatchProgressBar = memo(function BatchProgressBar({
  completed,
  total,
  showLabel = true,
  className = '',
  barClassName = ''
}: BatchProgressBarProps) {
  const percentage = getProgressPercentage(completed, total);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gray-800 transition-all duration-300 ${barClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-gray-600 shrink-0">
          {percentage}%
        </span>
      )}
    </div>
  );
});
