import { memo, useState } from 'react';
import { Activity, Building, DollarSign, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { FinancialReport } from 'shared/client';
import { FieldGroup, getGroupedFields } from './ReportFieldGroup';

interface ReportsTableProps {
  readonly data: readonly FinancialReport[];
  readonly chartData: readonly {
    readonly yearStr: string;
    readonly year: number;
  }[];
}

export const ReportsTable = memo(function ReportsTable({ data }: ReportsTableProps) {
  const [chartHoverByField, setChartHoverByField] = useState<Record<string, number | null>>({});

  const latest = data[0] ?? { inn: '', year: 0 } as FinancialReport;
  const { balance, pl, cash, purpose, other } = getGroupedFields(latest);

  const groups = [
    { label: 'Результаты деятельности', data: pl, icon: Activity, iconClass: 'bg-gray-100 text-gray-600' },
    { label: 'Внеоборотные и оборотные активы', data: balance, icon: Building, iconClass: 'bg-gray-100 text-gray-600' },
    { label: 'Движение денежных средств', data: cash, icon: DollarSign, iconClass: 'bg-gray-100 text-gray-600' },
    { label: 'Целевое использование средств', data: purpose, icon: TrendingUp, iconClass: 'bg-gray-100 text-gray-600' },
    { label: 'Прочие сведения', data: other, icon: PieChartIcon, iconClass: 'bg-gray-100 text-gray-600' },
  ].filter(g => Object.keys(g.data).length > 0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-200 overflow-hidden">
      <div className="p-6 border-b-2 border-gray-200 bg-gray-50/50">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          Бухгалтерская отчетность (ФНС)
          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-bold">Аналитика</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">Наведите на мини-график — сумма обновится в тексте рядом; без курсора — значение за последний год</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group, idx) => (
          <FieldGroup
            key={idx}
            label={group.label}
            data={group.data}
            icon={group.icon}
            iconClass={group.iconClass}
            dataRows={data}
            chartHoverByField={chartHoverByField}
            setChartHoverByField={setChartHoverByField}
          />
        ))}
      </div>
    </div>
  );
});
