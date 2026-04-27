"use client";

import { MapPin, Calendar, Banknote, Plus, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { translateRegion } from '@/lib/regions';
import { abbreviateLegalForm } from '@/lib/companyName';
import { getOkvedName } from '@/lib/okved';
import type { CompanyMeta } from 'shared/client';
import { BatchSelectHeader } from './BatchSelectHeader';

interface OrganizationsCardListProps {
  data: CompanyMeta[];
  loading: boolean;
  pageItems: { inn: string; name: string }[];
  batchInnSet: Set<string>;
  formatCurrency: (val: number | undefined) => string;
  toggleBatch: (inn: string, name: string, e: React.MouseEvent) => void;
  toggleBatchPage: (items: { inn: string; name: string }[], e?: React.SyntheticEvent) => void;
}

export function OrganizationsCardList({
  data,
  loading,
  pageItems,
  batchInnSet,
  formatCurrency,
  toggleBatch,
  toggleBatchPage
}: OrganizationsCardListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="py-12 text-center text-gray-500 font-medium">Организации не найдены.</div>;
  }

  return (
    <>
      {pageItems.length > 0 && (
        <BatchSelectHeader
          allPageInBatch={pageItems.every((x) => batchInnSet.has(x.inn))}
          somePageInBatch={pageItems.some((x) => batchInnSet.has(x.inn))}
          pageItems={pageItems}
          toggleBatchPage={toggleBatchPage}
          variant="mobile"
        />
      )}
      {data.map((row, i) => {
        const id = row.inn || row.ogrn || '';
        const inBatch = batchInnSet.has(id);
        return (
          <div
            key={id || i}
            onClick={() => router.push(`/organizations/${id}`)}
            className="p-6 rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-gray-100/50 border border-gray-200 shadow-md hover:shadow-xl hover:scale-[1.01] hover:border-gray-300 transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-bold text-gray-900 truncate" title={row.name}>
                  {abbreviateLegalForm(row.name) || <span className="text-gray-400 font-normal italic">Без названия</span>}
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${row.status === 'Действующая' ? 'text-gray-700' : 'text-gray-500'}`}>{row.status || 'Неизвестно'}</span>
                  <span className="font-mono text-[10px] font-bold text-gray-500">
                    ИНН: {row.inn || '—'}
                    {row.region && <span className="text-gray-400 font-normal"> · {translateRegion(row.region)}</span>}
                    {row.okved && (() => {
                      const name = getOkvedName(row.okved);
                      return (
                        <span className="text-gray-400 font-normal" title={name ?? row.okved}>
                          {' · '}{row.okved}{name ? ` — ${name}` : ''}
                        </span>
                      );
                    })()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Banknote className="w-4 h-4 text-gray-400 shrink-0" />
                    {formatCurrency(row.revenue)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    {row.age !== undefined ? `${row.age} л.` : '-'}
                  </div>
                  {row.lon && row.lat ? <MapPin className="w-4 h-4 text-gray-600" /> : null}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBatch(id, row.name || '', e);
                  }}
                  className={`min-h-12 min-w-12 flex items-center justify-center rounded-2xl transition-all duration-200 shrink-0 ${
                    inBatch ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                  title={inBatch ? 'Убрать из батча' : 'Добавить в батч'}
                >
                  {inBatch ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
