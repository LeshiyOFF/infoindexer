import { memo, useMemo, type ReactNode } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import { FinancialReport } from 'shared/client';
import { toRubles, formatNumber } from '@/lib/currency';

interface FinancialChartsProps {
  readonly data: readonly FinancialReport[];
}

export const FinancialCharts = memo(function FinancialCharts({ data }: FinancialChartsProps) {
  const chartData = useMemo(() => {
    return [...data].reverse().map(d => ({
      ...d,
      yearStr: `${d.year} г.`,
      revenue: toRubles(d.PL_revenue),
      netProfit: toRubles(d.PL_net_profit),
      assets: toRubles(d.B_assets),
      equity: toRubles(d.B_total_equity),
      liabilities: toRubles(d.B_assets) - toRubles(d.B_total_equity),
    }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <>
      {chartData.length >= 1 && <DynamicsChart data={chartData} />}
      {chartData.length > 1 && <AssetsChart data={chartData} />}
    </>
  );
});

interface DynamicsChartProps {
  readonly data: readonly {
    readonly yearStr: string;
    readonly revenue: number;
    readonly netProfit: number;
  }[];
}

const DynamicsChart = memo(function DynamicsChart({ data }: DynamicsChartProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Динамика по отчетным годам</h3>
      <p className="text-xs text-gray-500 mb-6">Выручка (столбцы), чистая прибыль (линия). Наведите на точку для деталей.</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="yearStr" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }} dy={10} />
            <YAxis
              tickFormatter={(val: number) => {
                if (val >= 1e9) return `${(val / 1e9).toFixed(1)} млрд`;
                if (val >= 1e6) return `${(val / 1e6).toFixed(0)} млн`;
                return `${(val / 1e3).toFixed(0)} тыс`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              dx={-5}
              width={55}
            />
            <Tooltip
              formatter={(v: string | number | undefined) => [formatNumber(v ?? 0, false) + ' ₽']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '12px 16px', fontSize: '13px' }}
              labelFormatter={(label: ReactNode) => `Отчётный год: ${label}`}
            />
            <Bar dataKey="revenue" name="Выручка" fill="#374151" radius={[6, 6, 0, 0]} maxBarSize={48} />
            <Line type="monotone" dataKey="netProfit" name="Чистая прибыль" stroke="#4B5563" strokeWidth={3} dot={{ r: 5, fill: '#4B5563', strokeWidth: 2, stroke: '#fff' }} strokeDasharray="" />
            <Legend wrapperStyle={{ paddingTop: 16 }} formatter={(value) => <span className="text-xs font-bold text-gray-600">{value}</span>} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

interface AssetsChartProps {
  readonly data: readonly {
    readonly yearStr: string;
    readonly assets: number;
    readonly liabilities: number;
  }[];
}

const AssetsChart = memo(function AssetsChart({ data }: AssetsChartProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Активы и заёмный капитал</h3>
      <p className="text-xs text-gray-500 mb-6">Суммарные активы (заливка), заёмные средства (пунктир).</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="yearStr" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }} dy={10} />
            <YAxis
              tickFormatter={(val: number) => (val >= 1e9 ? `${(val / 1e9).toFixed(1)} млрд` : (val >= 1e6 ? `${(val / 1e6).toFixed(0)} млн` : `${(val / 1e3).toFixed(0)} тыс`))}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              dx={-5}
              width={55}
            />
            <Tooltip formatter={(v: string | number | undefined) => [formatNumber(v ?? 0, false) + ' ₽']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '12px 16px' }} />
            <Area type="monotone" dataKey="assets" name="Активы" stroke="#6B7280" fill="url(#colorAssets)" strokeWidth={2} />
            <Line type="monotone" dataKey="liabilities" name="Заёмный капитал" stroke="#4B5563" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6B7280" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6B7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Legend wrapperStyle={{ paddingTop: 12 }} formatter={(value) => <span className="text-xs font-bold text-gray-600">{value}</span>} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
