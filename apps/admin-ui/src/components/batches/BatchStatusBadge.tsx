/**
 * Badge для отображения статуса батча
 *
 * @remarks
 * Переиспользуемый компонент для отображения статуса.
 */

"use client";

import { memo } from 'react';
import { getStatusLabel, getStatusBadgeClass } from '@/lib/batch-status.utils';
import type { BatchStatus } from './ports';

export interface BatchStatusBadgeProps {
  readonly status: BatchStatus;
  readonly className?: string;
}

export const BatchStatusBadge = memo(function BatchStatusBadge({
  status,
  className = ''
}: BatchStatusBadgeProps) {
  const badgeClass = getStatusBadgeClass(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${badgeClass} ${className}`}
    >
      {label}
    </span>
  );
});
