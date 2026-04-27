import { memo, useMemo } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import { FinancialReport, getCreationDate } from 'shared/client';
import { toRubles } from '@/lib/currency';

interface RisksCardProps {
  readonly data: readonly FinancialReport[];
  readonly displayStatus: string;
}

interface RiskItem {
  readonly level: 'high' | 'medium' | 'low';
  readonly msg: string;
}

export const RisksCard = memo(function RisksCard({ data, displayStatus }: RisksCardProps) {
  const risks = useMemo(() => calculateRisks(data, displayStatus), [data, displayStatus]);

  if (risks.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-gray-600" /> Анализ рисков
      </h3>
      <div className="space-y-3">
        {risks.map((risk, i) => (
          <RiskItem key={i} risk={risk} />
        ))}
      </div>
      <div className="pt-4 mt-4 border-t border-gray-50">
        <p className="text-[10px] font-medium text-gray-400 leading-relaxed italic">
          * Данный анализ носит справочный характер и не является окончательным вердиктом о благонадёжности.
        </p>
      </div>
    </div>
  );
});

function calculateRisks(data: readonly FinancialReport[], displayStatus: string): readonly RiskItem[] {
  if (!data.length) return [];
  const list: RiskItem[] = [];

  const latest = data[0];
  const revenueRub = toRubles(latest.PL_revenue);
  const charterCapitalRub = toRubles(latest.B_charter_capital);
  const creationDate = getCreationDate(latest);

  if (revenueRub === 0) {
    list.push({ level: 'high', msg: 'Нулевая выручка за последний отчётный год' });
  }
  if (charterCapitalRub <= 10_000) {
    list.push({ level: 'low', msg: 'Минимальный уставный капитал (10к ₽)' });
  }
  if (creationDate) {
    const yearsDiff = new Date().getFullYear() - new Date(creationDate).getFullYear();
    if (yearsDiff <= 1) {
      list.push({ level: 'medium', msg: 'Компания создана менее года назад' });
    }
  }
  if (displayStatus !== 'Действующая') {
    list.push({ level: 'high', msg: `Статус: ${displayStatus}` });
  }

  return list;
}

interface RiskItemProps {
  readonly risk: RiskItem;
}

const RiskItem = memo(function RiskItem({ risk }: RiskItemProps) {
  const bgClass = {
    high: 'bg-gray-200 border-gray-300 text-gray-800',
    medium: 'bg-gray-100 border-gray-200 text-gray-700',
    low: 'bg-gray-50 border-gray-100 text-gray-600',
  }[risk.level];

  const Icon = risk.level === 'high' ? ShieldAlert : Activity;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass}`}>
      <div className="mt-0.5"><Icon className="w-4 h-4" /></div>
      <p className="text-xs font-bold leading-tight">{risk.msg}</p>
    </div>
  );
});
