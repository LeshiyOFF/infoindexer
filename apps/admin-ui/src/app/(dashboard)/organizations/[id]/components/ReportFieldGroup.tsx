import { memo } from 'react';
import { FinancialReport } from 'shared/client';
import { FieldRow } from './ReportFieldRow';

interface FieldGroupProps {
  readonly label: string;
  readonly data: Record<string, string | number>;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly iconClass: string;
  readonly dataRows: readonly FinancialReport[];
  readonly chartHoverByField: Record<string, number | null>;
  readonly setChartHoverByField: React.Dispatch<React.SetStateAction<Record<string, number | null>>>;
}

export const FieldGroup = memo(function FieldGroup({ label, data, icon: Icon, iconClass, dataRows, chartHoverByField, setChartHoverByField }: FieldGroupProps) {
  return (
    <div className="flex flex-col bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconClass}`}><Icon className="w-4 h-4" /></div>
        <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">{label}</h3>
      </div>
      <div className="p-4 space-y-0">
        {Object.keys(data).map((key) => (
          <FieldRow
            key={key}
            fieldKey={key}
            groupLabel={label}
            data={dataRows}
            chartHoverByField={chartHoverByField}
            setChartHoverByField={setChartHoverByField}
          />
        ))}
      </div>
    </div>
  );
});

export function getGroupedFields(row: { readonly [key: string]: unknown }) {
  const balance: Record<string, string | number> = {};
  const pl: Record<string, string | number> = {};
  const cash: Record<string, string | number> = {};
  const purpose: Record<string, string | number> = {};
  const other: Record<string, string | number> = {};

  Object.keys(row).forEach(key => {
    if (['year', 'inn', 'ogrn', 'region', 'region_taxcode', 'creation_date', 'dissolution_date', 'age', 'eligible', 'okved', 'okved_section', 'lon', 'lat'].includes(key)) return;
    const val = row[key];
    if (val === null || val === undefined || val === 0 || val === '0') return;
    if (key.startsWith('B_')) balance[key] = val as string | number;
    else if (key.startsWith('PL_')) pl[key] = val as string | number;
    else if (key.startsWith('CF_') || key.startsWith('CFi_') || key.startsWith('CFo_')) cash[key] = val as string | number;
    else if (key.startsWith('PU_')) purpose[key] = val as string | number;
    else other[key] = val as string | number;
  });

  return { balance, pl, cash, purpose, other };
}
