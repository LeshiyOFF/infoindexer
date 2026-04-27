/**
 * Sanctions Detail Section
 *
 * Секция детализированных санкций на странице компании.
 */

"use client";

import { memo, useMemo } from 'react';
import { ShieldAlert, ExternalLink, AlertCircle } from 'lucide-react';
import type { SanctionDTO } from 'shared/domain/entities';

/**
 * Форматирует дату в формат DD.MM.YYYY
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

interface Props {
  readonly sanctions: readonly SanctionDTO[];
  readonly className?: string;
  readonly isLoading?: boolean;
}

/**
 * Секция детализированных санкций на странице компании
 */
export const SanctionsSection = memo(function SanctionsSection({
  sanctions,
  className = '',
  isLoading = false
}: Props) {
  const activeCount = useMemo(
    () => sanctions.filter(s => s.isActive).length,
    [sanctions]
  );

  if (isLoading) {
    return (
      <div className={`p-6 rounded-3xl border border-gray-200 bg-gray-50 animate-pulse ${className}`}>
        <div className="h-5 bg-gray-300 rounded w-48 mb-4" />
        <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-64" />
      </div>
    );
  }

  if (sanctions.length === 0) {
    return (
      <div className={`p-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Санкций не обнаружено
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Компания не находится под санкционными ограничениями
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 ${className}`}>
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" />
        Sanctions & Risk Indicators
      </h3>

      <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
        <p className="text-sm font-semibold text-red-900">
          {sanctions.length} санкционн{sanctions.length > 1 ? 'ых программ' : 'ая программа'}
          {activeCount > 0 && ` (${activeCount} активн${activeCount > 1 ? 'ых' : 'ая'})`}
        </p>
      </div>

      <div className="space-y-3">
        {sanctions.map(s => (
          <SanctionCard key={s.id} sanction={s} />
        ))}
      </div>

      <p className="text-[10px] text-gray-400 mt-5 italic flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Источник: OpenSanctions. Данные требуют верификации.
      </p>
    </div>
  );
}, function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.className === nextProps.className &&
    prevProps.sanctions.length === nextProps.sanctions.length &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.sanctions.every((s, i) => s.id === nextProps.sanctions[i]?.id)
  );
});

/**
 * Карточка отдельной санкции
 */
interface SanctionCardProps {
  readonly sanction: SanctionDTO;
}

const SanctionCard = memo(function SanctionCard({ sanction }: SanctionCardProps) {
  const isActive = sanction.isActive;

  const period = useMemo(
    () => sanction.endDate
      ? `${formatDate(sanction.startDate)} – ${formatDate(sanction.endDate)}`
      : `с ${formatDate(sanction.startDate)}`,
    [sanction.startDate, sanction.endDate]
  );

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isActive
        ? 'bg-red-50/80 border-red-200 hover:bg-red-50'
        : 'bg-gray-50/80 border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-gray-900 truncate">
            {sanction.program}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {sanction.authority}
          </p>
        </div>

        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
          isActive
            ? 'bg-red-200 text-red-800'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {isActive ? 'активна' : 'снята'}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium ${isActive ? 'text-red-700' : 'text-gray-600'}`}>
          📅 {period}
        </span>
      </div>

      <a
        href={sanction.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Документ
      </a>
    </div>
  );
});
