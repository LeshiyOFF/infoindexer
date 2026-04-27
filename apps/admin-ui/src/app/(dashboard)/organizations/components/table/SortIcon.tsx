/**
 * Icon сортировки для заголовка таблицы
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только отображение иконки.
 * DRY: переиспользуется для всех колонок.
 */

"use client";

import { memo } from 'react';
import type { ISortPort } from '../../domain/ports/table-ports';

export interface SortIconProps extends Pick<ISortPort, 'sortBy' | 'sortOrder'> {
  readonly field: string;
}

export const SortIcon = memo(function SortIcon({ sortBy, sortOrder, field }: SortIconProps) {
  const isActive = sortBy === field;
  const icon = isActive
    ? (sortOrder === 'ASC' ? '↑' : '↓')
    : '⇅';

  return (
    <span
      className={`ml-1 inline-block w-3 h-3 ${
        isActive ? 'text-gray-700 text-xs font-bold' : 'text-gray-300'
      }`}
      aria-label={`Сортировка по ${field}: ${sortOrder || 'нет'}`}
    >
      {icon}
    </span>
  );
});
