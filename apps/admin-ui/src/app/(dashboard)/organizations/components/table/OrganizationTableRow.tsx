/**
 * Row компонент для таблицы организаций
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только рендеринг строки.
 * DIP: получает formatted данные через props.
 */

"use client";

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Banknote, Calendar, Plus, Check } from 'lucide-react';
import { translateRegion } from '@/lib/regions';
import { abbreviateLegalForm } from '@/lib/companyName';
import { getOkvedName } from '@/lib/okved';
import type { CompanyMeta } from 'shared/client';

export interface OrganizationTableRowProps {
  readonly company: CompanyMeta;
  readonly isInBatch: boolean;
  readonly toggleBatch: (inn: string, name: string, e: React.MouseEvent) => void;
  readonly formatCurrency: (value: number | undefined) => string;
}

export const OrganizationTableRow = memo(function OrganizationTableRow({
  company,
  isInBatch,
  toggleBatch,
  formatCurrency
}: OrganizationTableRowProps) {
  const router = useRouter();
  const id = company.inn || company.ogrn || '';

  const handleClick = useCallback(() => {
    if (id) router.push(`/organizations/${id}`);
  }, [id, router]);

  const handleToggleBatch = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBatch(id, company.name || '', e);
  }, [id, company.name, toggleBatch]);

  if (!id) return null;

  return (
    <tr
      onClick={handleClick}
      className="hover:bg-gray-100 transition-colors cursor-pointer group"
    >
      {/* Name Cell */}
      <td className="px-6 py-4 overflow-hidden">
        <div className="flex flex-col min-w-0 gap-0.5">
          <span className="font-bold text-gray-900 truncate" title={company.name}>
            {abbreviateLegalForm(company.name) || (
              <span className="text-gray-300 font-normal italic lowercase">Без названия</span>
            )}
          </span>
          <OrganizationMeta company={company} />
        </div>
      </td>

      {/* Revenue Cell */}
      <td className="px-6 py-4">
        <MetricCell
          icon={<Banknote className="w-3.5 h-3.5" />}
          value={formatCurrency(company.revenue)}
        />
      </td>

      {/* Age Cell */}
      <td className="px-6 py-4">
        <MetricCell
          icon={<Calendar className="w-3.5 h-3.5" />}
          value={company.age !== undefined ? `${company.age} л.` : '-'}
        />
      </td>

      {/* Geo Cell */}
      <td className="px-6 py-4 text-center">
        {company.lon && company.lat ? (
          <MapPin className="w-4 h-4 text-gray-600 inline-block opacity-60" />
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>

      {/* Batch Cell */}
      <td className="px-6 py-4 text-center">
        <BatchToggleButton
          isInBatch={isInBatch}
          onToggle={handleToggleBatch}
        />
      </td>
    </tr>
  );
});

// === Sub-components (composition over inheritance) ===

interface MetricCellProps {
  readonly icon: React.ReactNode;
  readonly value: string;
}

const MetricCell = memo(function MetricCell({ icon, value }: MetricCellProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
});

interface OrganizationMetaProps {
  readonly company: CompanyMeta;
}

const OrganizationMeta = memo(function OrganizationMeta({ company }: OrganizationMetaProps) {
  const statusClass = company.status === 'Действующая'
    ? 'text-gray-700'
    : 'text-gray-500';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`text-[9px] font-black uppercase tracking-tighter ${statusClass}`}>
        {company.status || 'Неизвестно'}
      </span>
      <span className="font-mono text-[10px] font-bold text-gray-500">
        ИНН: {company.inn || '—'}
        {company.region && (
          <span className="text-gray-400 font-normal"> · {translateRegion(company.region)}</span>
        )}
        {company.okved && <OkvedDisplay code={company.okved} />}
      </span>
    </div>
  );
});

interface OkvedDisplayProps {
  readonly code: string;
}

const OkvedDisplay = memo(function OkvedDisplay({ code }: OkvedDisplayProps) {
  const name = getOkvedName(code);
  return (
    <span className="text-gray-400 font-normal" title={name ?? code}>
      {' · '}{code}{name ? ` — ${name}` : ''}
    </span>
  );
});

interface BatchToggleButtonProps {
  readonly isInBatch: boolean;
  readonly onToggle: (e: React.MouseEvent) => void;
}

const BatchToggleButton = memo(function BatchToggleButton({ isInBatch, onToggle }: BatchToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-2xl transition-all duration-200 ${
        isInBatch
          ? 'bg-gray-800 text-white hover:bg-gray-900'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
      }`}
      title={isInBatch ? 'Убрать из батча' : 'Добавить в батч'}
    >
      {isInBatch ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
    </button>
  );
});
