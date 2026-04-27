/**
 * Filter Controls для контактов
 *
 * @remarks
 * Переиспользуемый компонент для управления фильтрами.
 */

"use client";

import { memo } from 'react';
import type { FilterType, FilterRelevance } from '@/lib/batch-contact.utils';

/** Props для ContactFilters */
export interface ContactFiltersProps {
  readonly filterType: FilterType;
  readonly filterRelevance: FilterRelevance;
  readonly onTypeChange: (type: FilterType) => void;
  readonly onRelevanceChange: (relevance: FilterRelevance) => void;
}

/**
 * Filter Button
 */
interface FilterButtonProps<T extends string> {
  readonly value: T;
  readonly current: T;
  readonly label: string;
  readonly onChange: (value: T) => void;
}

const FilterButton = <T extends string>({
  value,
  current,
  label,
  onChange
}: FilterButtonProps<T>) => (
  <button
    onClick={() => onChange(value)}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
      current === value
        ? 'bg-black text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
    }`}
  >
    {label}
  </button>
);

/**
 * Filter Controls для контактов
 */
export const ContactFilters = memo(function ContactFilters({
  filterType,
  filterRelevance,
  onTypeChange,
  onRelevanceChange
}: ContactFiltersProps) {
  const typeOptions: readonly { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'mail', label: 'Почта' },
    { value: 'phone', label: 'Телефоны' }
  ] as const;

  const relevanceOptions: readonly { value: FilterRelevance; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'relevant', label: 'Релевантно' },
    { value: 'not_relevant', label: 'Нерелевантно' }
  ] as const;

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-x-4 sm:gap-y-3 shrink-0 min-w-0 overflow-x-auto max-w-full">
      {/* Type Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 shrink-0">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest shrink-0">
          Тип:
        </span>
        <div className="flex flex-wrap gap-2 min-w-0">
          {typeOptions.map(opt => (
            <FilterButton
              key={opt.value}
              value={opt.value}
              current={filterType}
              label={opt.label}
              onChange={onTypeChange}
            />
          ))}
        </div>
      </div>

      {/* Relevance Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 shrink-0">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest shrink-0">
          Релевантность:
        </span>
        <div className="flex flex-wrap gap-2 min-w-0">
          {relevanceOptions.map(opt => (
            <FilterButton
              key={opt.value}
              value={opt.value}
              current={filterRelevance}
              label={opt.label}
              onChange={onRelevanceChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
