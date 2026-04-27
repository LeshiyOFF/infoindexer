/**
 * Header для фильтров organisations
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только заголовок, поиск, toggle.
 * ISP: зависит только от нужных Ports.
 */

"use client";

import { memo } from 'react';
import { Filter, Search } from 'lucide-react';
import type { ISearchPort, IFilterVisibilityPort, IFilterStatisticsPort } from '../../domain/ports/filter-ports';

export type FiltersHeaderProps =
  ISearchPort &
  IFilterVisibilityPort &
  IFilterStatisticsPort

export const FiltersHeader = memo(function FiltersHeader({
  totalCount,
  totalPages,
  search,
  onSearchChange,
  showFilters,
  hasActiveFilters,
  onShowFiltersToggle
}: FiltersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <FilterStats totalCount={totalCount} totalPages={totalPages} />
      <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
        <SearchInput value={search} onChange={onSearchChange} />
        <FilterToggleButton
          show={showFilters}
          hasActive={hasActiveFilters}
          onToggle={onShowFiltersToggle}
        />
      </div>
    </div>
  );
});

// === Sub-components ===

type FilterStatsProps = Pick<IFilterStatisticsPort, 'totalCount' | 'totalPages'>

const FilterStats = memo(function FilterStats({ totalCount, totalPages }: FilterStatsProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Организации</h1>
      <p className="text-gray-500 text-sm font-medium">
        Найдено {totalCount.toLocaleString()} уникальных записей
        {totalPages && totalPages > 0 && (
          <span className="text-gray-400"> · {totalPages} {getPageLabel(totalPages)}</span>
        )}
      </p>
    </div>
  );
});

function getPageLabel(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 19) return 'страниц';
  if (lastOne === 1) return 'страница';
  if (lastOne >= 2 && lastOne <= 4) return 'страницы';
  return 'страниц';
}

interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const SearchInput = memo(function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
      <input
        type="text"
        placeholder="Поиск по ИНН, ОГРН или названию..."
        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Поиск организаций"
      />
    </div>
  );
});

interface FilterToggleButtonProps {
  readonly show: boolean;
  readonly hasActive: boolean;
  readonly onToggle: () => void;
}

const FilterToggleButton = memo(function FilterToggleButton({ show, hasActive, onToggle }: FilterToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
        show || hasActive
          ? 'bg-gray-100 border-2 border-gray-300 text-gray-800'
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
      }`}
    >
      <Filter className="w-4 h-4" />
      Фильтры {hasActive && '(Активны)'}
    </button>
  );
});
