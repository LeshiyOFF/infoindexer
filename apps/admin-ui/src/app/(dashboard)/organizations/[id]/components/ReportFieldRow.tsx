import { memo, useMemo, useCallback } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { FinancialReport } from 'shared/client';
import { translateField } from '@/lib/translations';
import { toRubles } from '@/lib/currency';

/** Поля-коды в «Прочие сведения»: отображаются как код (синий фон), без графика и тренда */
const CODE_FIELDS = ['okpo', 'okopf', 'okogu', 'okfc', 'okfs', 'okato', 'oktmo'] as const;

interface FieldRowProps {
  readonly fieldKey: string;
  readonly groupLabel: string;
  readonly data: readonly FinancialReport[];
  readonly chartHoverByField: Record<string, number | null>;
  readonly setChartHoverByField: React.Dispatch<React.SetStateAction<Record<string, number | null>>>;
}

export const FieldRow = memo(function FieldRow({ fieldKey, groupLabel, data, chartHoverByField, setChartHoverByField }: FieldRowProps) {
  const isCodeField = groupLabel === 'Прочие сведения' && CODE_FIELDS.includes(fieldKey as typeof CODE_FIELDS[number]);
  const defaultYear = data[0]?.year ?? 0;
  const displayYearForField = chartHoverByField[fieldKey] ?? defaultYear;
  const yearDataForField = data.find(d => d.year === displayYearForField) || data[0];
  const displayVal = (yearDataForField as Record<string, unknown>)[fieldKey] as string | number | null | undefined;
  const numVal = Number(displayVal);
  const rubVal = toRubles(displayVal);
  const prevYearData = data.find(d => d.year === displayYearForField - 1);
  const prevVal = prevYearData ? toRubles((prevYearData as Record<string, unknown>)[fieldKey] as string | number | null | undefined) : null;
  const change = prevVal !== null && prevVal !== 0 ? ((rubVal - prevVal) / Math.abs(prevVal)) * 100 : null;
  const isNegative = numVal < 0;
  const trendData = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year).map(d => ({ v: toRubles((d as Record<string, unknown>)[fieldKey] as string | number | null | undefined), year: d.year }));
  }, [data, fieldKey]);

  if (isCodeField) {
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
        <span className="text-gray-600 text-sm font-medium flex items-center gap-2">
          {translateField(fieldKey)}
          <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
        </span>
        <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
          {String(displayVal ?? '—')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-sm font-medium text-gray-500 truncate" title={fieldKey}>{translateField(fieldKey)}</span>
        <div className="flex items-center gap-3 shrink-0 w-[9rem]">
          {trendData.length > 1 && (
            <MiniChart
              trendData={trendData}
              isNegative={isNegative}
              fieldKey={fieldKey}
              setChartHoverByField={setChartHoverByField}
            />
          )}
          <span className={`text-sm font-bold tabular-nums text-right flex-1 min-w-0 truncate ${isNegative ? 'text-gray-600' : 'text-gray-900'}`}>
            {formatNumber(displayVal)}
          </span>
        </div>
      </div>
      <div className="min-h-[1.25rem] flex items-center">
        {change !== null ? <ChangeBadge change={change} /> : null}
      </div>
    </div>
  );
});

interface MiniChartProps {
  readonly trendData: readonly { readonly v: number; readonly year: number }[];
  readonly isNegative: boolean;
  readonly fieldKey: string;
  readonly setChartHoverByField: React.Dispatch<React.SetStateAction<Record<string, number | null>>>;
}

const MiniChart = memo(function MiniChart({ trendData, isNegative, fieldKey, setChartHoverByField }: MiniChartProps) {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.min(Math.floor(ratio * trendData.length), trendData.length - 1);
    const point = trendData[idx];
    if (point) {
      setChartHoverByField(prev => (prev[fieldKey] === point.year ? prev : { ...prev, [fieldKey]: point.year }));
    }
  }, [trendData, fieldKey, setChartHoverByField]);

  const handleMouseLeave = useCallback(() => {
    setChartHoverByField(prev => ({ ...prev, [fieldKey]: null }));
  }, [fieldKey, setChartHoverByField]);

  return (
    <div
      className="w-14 h-5 hidden sm:block cursor-crosshair shrink-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData.map((t) => ({ v: t.v, year: t.year }))}>
          <Line type="monotone" dataKey="v" stroke={isNegative ? '#6B7280' : '#4b5563'} strokeWidth={2} dot={false} activeDot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

interface ChangeBadgeProps {
  readonly change: number;
}

const ChangeBadge = memo(function ChangeBadge({ change }: ChangeBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
      {change >= 0 ? (
        <span className="text-gray-700 flex items-center"><ArrowUpRight size={12}/> +{change.toFixed(1)}%</span>
      ) : (
        <span className="text-gray-600 flex items-center"><ArrowDownRight size={12}/> {change.toFixed(1)}%</span>
      )}
      <span className="text-gray-400 font-normal">к прошлому году</span>
    </div>
  );
});

function formatNumber(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '—';

  const abs = Math.abs(num);
  if (abs >= 1e9) return `${(num / 1e9).toFixed(2)} млрд ₽`;
  if (abs >= 1e6) return `${(num / 1e6).toFixed(2)} млн ₽`;
  if (abs >= 1e3) return `${(num / 1e3).toFixed(2)} тыс ₽`;
  return `${num.toFixed(2)} ₽`;
}
