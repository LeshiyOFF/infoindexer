import { memo, useMemo } from 'react';
import { DollarSign, Activity, ShieldAlert, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { FinancialReport } from 'shared/client';
import { toRubles, formatCurrency } from '@/lib/currency';

interface FinancialKPIProps {
  readonly latest: FinancialReport;
  readonly previous: FinancialReport | null;
  readonly maxValues: {
    readonly maxRev: number;
    readonly maxProfit: number;
    readonly maxAssets: number;
  };
}

interface KPICardProps {
  readonly title: string;
  readonly value: string | number | null | undefined;
  readonly growth: number | null;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly colorClass: string;
  readonly barPercent?: number;
  readonly barColor?: string;
}

export const FinancialKPI = memo(function FinancialKPI({ latest, previous, maxValues }: FinancialKPIProps) {
  const revenueRub = toRubles(latest.PL_revenue);
  const netProfitRub = toRubles(latest.PL_net_profit);
  const assetsRub = toRubles(latest.NA_net_assets || latest.B_assets);
  const equityRub = toRubles(latest.B_total_equity);

  const calcGrowth = useMemo(() => {
    return (curr: string | number | undefined, prev: string | number | undefined): number | null => {
      const c = typeof curr === 'string' ? parseFloat(curr) : curr || 0;
      const p = typeof prev === 'string' ? parseFloat(prev) : prev || 0;
      if (!p || !c) return null;
      return ((c - p) / Math.abs(p)) * 100;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Выручка"
        value={latest.PL_revenue}
        growth={calcGrowth(latest.PL_revenue, previous?.PL_revenue)}
        icon={DollarSign}
        colorClass="bg-gray-100 text-gray-600"
        barColor="bg-gray-900"
        barPercent={maxValues.maxRev ? (revenueRub / maxValues.maxRev) * 100 : undefined}
      />
      <KPICard
        title="Чистая прибыль"
        value={latest.PL_net_profit}
        growth={calcGrowth(latest.PL_net_profit, previous?.PL_net_profit)}
        icon={Activity}
        colorClass="bg-gray-50 text-gray-600"
        barColor={netProfitRub >= 0 ? 'bg-gray-500' : 'bg-gray-700'}
        barPercent={maxValues.maxProfit ? (Math.abs(netProfitRub) / maxValues.maxProfit) * 100 : undefined}
      />
      <KPICard
        title="Чистые активы"
        value={latest.NA_net_assets || latest.B_assets}
        growth={calcGrowth(latest.NA_net_assets || latest.B_assets, previous?.NA_net_assets || previous?.B_assets)}
        icon={ShieldAlert}
        colorClass="bg-gray-100 text-gray-600"
        barColor="bg-gray-800"
        barPercent={maxValues.maxAssets ? (assetsRub / maxValues.maxAssets) * 100 : undefined}
      />
      <KPICard
        title="Собственный капитал"
        value={latest.B_total_equity}
        growth={calcGrowth(latest.B_total_equity, previous?.B_total_equity)}
        icon={Users}
        colorClass="bg-gray-100 text-gray-600"
        barColor="bg-gray-700"
        barPercent={maxValues.maxAssets ? (equityRub / maxValues.maxAssets) * 100 : undefined}
      />
    </div>
  );
});

const KPICard = memo(function KPICard({ title, value, growth, icon: Icon, colorClass, barPercent, barColor = 'bg-gray-900' }: KPICardProps) {
  const formatValue = formatCurrency;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-xl ${colorClass}`}><Icon className="w-6 h-6" /></div>
        {growth !== null && (
          <div className={`flex items-center gap-1 text-xs font-bold ${growth >= 0 ? 'text-gray-700 bg-gray-100' : 'text-gray-600 bg-gray-100'} px-2.5 py-1 rounded-full`}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-extrabold text-gray-900 mb-2">{formatValue(value, true)}</h3>
        {barPercent !== undefined && barPercent > 0 && (
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(100, barPercent)}%` }} />
          </div>
        )}
      </div>
    </div>
  );
});
