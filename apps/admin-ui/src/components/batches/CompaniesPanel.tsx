/**
 * Panel для списка компаний батча
 *
 * @remarks
 * Переиспользуемый компонент для отображения списка организаций.
 */

"use client";

import { memo } from 'react';
import { Filter } from 'lucide-react';
import { abbreviateLegalForm } from '@/lib/companyName';
import type { BatchInnItem } from './ports';

/** Props для CompaniesPanel */
export interface CompaniesPanelProps {
  readonly companies: readonly BatchInnItem[];
  readonly selectedInn: string | null;
  readonly onSelect: (inn: string) => void;
  readonly onClearSelection?: () => void;
  readonly mobile?: boolean;
}

/**
 * Компонент одной компании
 */
interface CompanyItemProps {
  readonly inn: string;
  readonly name: string;
  readonly selected: boolean;
  readonly onSelect: (inn: string) => void;
  readonly mobile?: boolean;
}

const CompanyItem = memo(function CompanyItem({
  inn,
  name,
  selected,
  onSelect,
  mobile = false
}: CompanyItemProps) {
  const baseClasses = "p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2";
  const selectedClasses = mobile
    ? "bg-gray-900 text-white border-gray-900"
    : "bg-gray-200 border-gray-400";
  const unselectedClasses = mobile
    ? "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
    : "bg-gray-50 border-gray-200 hover:border-gray-400";

  return (
    <button
      type="button"
      onClick={() => onSelect(inn)}
      className={`${baseClasses} ${selected ? selectedClasses : unselectedClasses}`}
    >
      <span className="truncate text-sm font-bold flex-1 min-w-0" title={name}>
        {abbreviateLegalForm(name) || name}
      </span>
      {selected && (
        <Filter className="w-4 h-4 shrink-0" aria-label="Фильтр активен" />
      )}
    </button>
  );
});

/**
 * Panel для списка компаний
 */
export const CompaniesPanel = memo(function CompaniesPanel({
  companies,
  selectedInn,
  onSelect,
  onClearSelection,
  mobile = false
}: CompaniesPanelProps) {
  const handleSelect = (inn: string) => {
    // Toggle: если клик на выбранный, сбросить
    if (selectedInn === inn && onClearSelection) {
      onClearSelection();
    } else {
      onSelect(inn);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
          Организации этой очереди
        </h2>
        {selectedInn && onClearSelection && (
          <button
            onClick={onClearSelection}
            className="text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            Показать все
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto space-y-2">
        {companies.map(company => (
          <CompanyItem
            key={company.inn}
            inn={company.inn}
            name={company.name}
            selected={selectedInn === company.inn}
            onSelect={handleSelect}
            mobile={mobile}
          />
        ))}
      </div>
    </div>
  );
});
