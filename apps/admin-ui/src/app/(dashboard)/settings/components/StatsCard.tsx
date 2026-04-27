"use client";

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Database, HardDrive, BookOpen, Info } from 'lucide-react';
import { ContentTooltipPortal } from './ContentTooltipPortal';

export interface Stats {
  totalRecords: number;
  companiesGirBo: number;
  companiesEgrul: number;
  redisMemory: string;
}

const STATS = [
  {
    key: 'companiesGirBo' as const,
    icon: Database,
    label: 'Уникальных компаний с фин. отчётностью',
    tooltip: 'Количество уникальных ИНН в агрегированной выборке financial_reports_summary. ГИР БО — госреестр бухгалтерской отчётности.',
    getValue: (s: Stats) => s.companiesGirBo.toLocaleString()
  },
  {
    key: 'companiesEgrul' as const,
    icon: BookOpen,
    label: 'Записей ЕГРЮЛ',
    tooltip: 'Уникальные ИНН в companies_meta (данные из ЕГРЮЛ: название, директор, статус, адрес).',
    getValue: (s: Stats) => s.companiesEgrul.toLocaleString()
  },
  {
    key: 'totalRecords' as const,
    icon: Database,
    label: 'Строк фин. отчётов',
    tooltip: 'Общее число строк в financial_reports (все годы). Одна строка — один отчёт за год.',
    getValue: (s: Stats) => s.totalRecords.toLocaleString()
  },
  {
    key: 'redisMemory' as const,
    icon: HardDrive,
    label: 'Память Redis',
    tooltip: 'Текущее использование памяти Redis: очереди задач, статусы батчей.',
    getValue: (s: Stats) => s.redisMemory
  }
];

export function StatsCard({ stats }: { stats: Stats }) {
  const [tooltipKey, setTooltipKey] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-6">
        Статистика
      </h2>
      <div className="space-y-4">
        {STATS.map(({ key, icon: Icon, label, tooltip, getValue }) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <Icon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-gray-600">{label}:</span>
            <span className="font-bold text-gray-900">{getValue(stats)}</span>
            <div
              ref={(el) => { refs.current[key] = el; }}
              className="relative ml-auto"
              onMouseEnter={() => setTooltipKey(key)}
              onMouseLeave={() => setTooltipKey(null)}
            >
              <button
                type="button"
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Подсказка"
              >
                <Info className="w-4 h-4" />
              </button>
              {tooltipKey === key && typeof document !== 'undefined' && createPortal(
                <ContentTooltipPortal
                  anchorRef={{ current: refs.current[key] }}
                  content={tooltip}
                  onClose={() => setTooltipKey(null)}
                />,
                document.body
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
