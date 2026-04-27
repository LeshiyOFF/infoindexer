/**
 * Feed для отображения результатов батча
 *
 * @remarks
 * Отображает контакты с фильтрацией.
 * Использует batch-contact.utils.ts и переиспользуемые компоненты.
 */

"use client";

import { memo, useMemo } from 'react';
import { AlertCircle, Loader2, Clock } from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { useBatchFilters } from '@/hooks/useBatchFilters';
import {
  flattenContactsFromProgress,
  flattenContactsFromArchive,
  getCompaniesWithoutResults
} from '@/lib/batch-contact.utils';
import { ContactCard, ContactFilters } from './index';
import type { BatchResult } from './ports';
import type { FilterType, FilterRelevance } from '@/lib/batch-contact.utils';

/** Props для BatchResultsFeed */
export interface BatchResultsFeedProps {
  readonly isArchive: boolean;
  readonly batchId: string | null;
  readonly archiveResults: Readonly<Record<string, { status: string; data?: unknown; error?: string }>> | null;
  readonly archiveInns?: readonly { inn: string; name: string }[];
  readonly selectedCompanyInn?: string | null;
}

/**
 * Секция компаний без результатов
 */
interface CompaniesWithoutResultsProps {
  readonly companies: readonly { inn: string; name: string; statusLabel: string; error?: string }[];
}

const CompaniesWithoutResults = memo(function CompaniesWithoutResults({
  companies
}: CompaniesWithoutResultsProps) {
  if (companies.length === 0) return null;

  return (
    <div className="shrink-0 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">
        Организации в процессе обработки
      </h3>
      <div className="space-y-2">
        {companies.map(({ inn, name, statusLabel, error }) => (
          <div key={inn} className="flex items-center justify-between gap-3 rounded-lg bg-white/80 p-3 border border-gray-100">
            <span className="truncate text-sm text-gray-900" title={name}>{name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                statusLabel === 'Ошибка' ? 'text-red-600' : statusLabel === 'В процессе' ? 'text-gray-700' : 'text-gray-600'
              }`}>
                {statusLabel === 'Ошибка' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                {statusLabel === 'В процессе' && <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />}
                {(statusLabel === 'Ожидание' || statusLabel === 'Нет данных') && <Clock className="w-3.5 h-3.5 shrink-0" />}
                {statusLabel}
              </span>
              {error && <span className="text-[10px] text-red-600 truncate max-w-[120px]" title={error}>{error}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Feed для результатов батча
 */
export function BatchResultsFeed({
  isArchive,
  batchId,
  archiveResults,
  archiveInns,
  selectedCompanyInn = null
}: BatchResultsFeedProps) {
  const { batchItems, batchProgress } = useBatch();

  // Get all contacts
  const allContacts = useMemo(() => {
    if (isArchive && archiveResults && archiveInns) {
      return flattenContactsFromArchive(
        archiveResults as Readonly<Record<string, BatchResult>>,
        archiveInns
      );
    }
    return flattenContactsFromProgress(batchItems, batchProgress);
  }, [isArchive, archiveResults, archiveInns, batchItems, batchProgress]);

  // Companies without results
  const companiesWithoutResults = useMemo(() => {
    if (!isArchive || !archiveResults || !archiveInns?.length) return [];
    return getCompaniesWithoutResults(
      archiveResults as Readonly<Record<string, BatchResult>>,
      archiveInns
    );
  }, [isArchive, archiveResults, archiveInns]);

  // Filters
  const { filterType, filterRelevance, setFilterType, setFilterRelevance, filteredContacts } = useBatchFilters(allContacts);

  return (
    <div key={batchId ?? 'active'} className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col gap-6 p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm h-full overflow-hidden min-w-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 shrink-0">Результаты</h2>

        <ContactFilters
          filterType={filterType}
          filterRelevance={filterRelevance}
          onTypeChange={setFilterType as (value: FilterType) => void}
          onRelevanceChange={setFilterRelevance as (value: FilterRelevance) => void}
        />

        <CompaniesWithoutResults companies={companiesWithoutResults} />

        <div className="flex-1 min-h-0 overflow-auto space-y-3">
          {filteredContacts.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">Нет контактов по выбранным фильтрам</p>
          ) : (
            filteredContacts.map((contact, i) => (
              <ContactCard key={`${contact.inn}-${contact.val}-${i}`} contact={contact} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
