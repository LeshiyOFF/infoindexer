import { memo } from 'react';
import { ArrowLeft, Building, Receipt, MapPin, Calendar, User, Activity, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CompanyMeta, FinancialReport, getCreationDate, getOkved } from 'shared/client';
import { abbreviateLegalForm } from '@/lib/companyName';
import { getOkvedName } from '@/lib/okved';

interface CompanyHeaderProps {
  readonly latest: FinancialReport;
  readonly meta: CompanyMeta | null;
  readonly contacts: {
    readonly name?: string;
    readonly director?: string;
    readonly status?: string;
    readonly address?: string;
  } | null;
  readonly onBack: () => void;
}

export const CompanyHeader = memo(function CompanyHeader({ latest, meta, contacts, onBack }: CompanyHeaderProps) {
  const router = useRouter();

  const displayName = abbreviateLegalForm(contacts?.name || meta?.name) || `Организация ${latest.inn || latest.ogrn}`;
  const displayDirector = contacts?.director || meta?.director || 'Нет данных';
  const displayStatus = contacts?.status || meta?.status || 'Действующая';
  const displayAddress = contacts?.address || meta?.address || 'Регион не указан';
  const okved = getOkved(latest);
  const creationDate = getCreationDate(latest) || 'Не указана';

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад к списку
        </button>
        <div className="flex items-center gap-2">
          {displayStatus.toLowerCase().includes('ликвид') ? (
            <span className="flex items-center gap-1.5 bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-300">
              <Activity className="w-3.5 h-3.5" /> {displayStatus}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-300">
              <Activity className="w-3.5 h-3.5" /> {displayStatus}
            </span>
          )}
        </div>
      </div>

      {/* Main identity card */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 min-w-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-gray-200">
              <Building className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-black text-gray-900 leading-tight mb-3 uppercase break-words">{displayName}</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 max-w-full">
                <IdentifierField icon={<Receipt className="w-4 h-4 shrink-0" />} label="ИНН:" value={latest.inn || 'Нет'} />
                <IdentifierField icon={<Receipt className="w-4 h-4 shrink-0" />} label="ОГРН:" value={latest.ogrn || 'Нет'} />
                {okved && <OkvedField okved={okved} router={router} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            <InfoRow icon={<User className="w-5 h-5" />} label="Руководитель" value={displayDirector} />
            <InfoRow icon={<MapPin className="w-5 h-5" />} label="Юридический адрес" value={displayAddress} />
            <InfoRow icon={<Calendar className="w-5 h-5" />} label="Дата регистрации" value={creationDate} />
          </div>
        </div>
      </div>
    </div>
  );
});

interface IdentifierFieldProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}

const IdentifierField = memo(function IdentifierField({ icon, label, value }: IdentifierFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 min-w-0 max-w-full overflow-hidden">
      <span className="flex items-center gap-2 text-gray-500 font-bold shrink-0">{icon} {label}</span>
      <span className="text-gray-900 font-mono break-all text-xs sm:text-sm">{value}</span>
    </div>
  );
});

interface OkvedFieldProps {
  readonly okved: string;
  readonly router: ReturnType<typeof useRouter>;
}

const OkvedField = memo(function OkvedField({ okved, router }: OkvedFieldProps) {
  const name = getOkvedName(okved);
  const prefix = okved.slice(0, okved.length > 4 ? 4 : 2);

  return (
    <>
      <div className="flex flex-col gap-0.5 sm:gap-1 text-sm bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 min-w-0 max-w-full overflow-hidden w-full sm:w-auto sm:max-w-sm">
        <span className="flex items-center gap-2 text-gray-500 font-bold shrink-0">
          <Activity className="w-4 h-4 shrink-0" /> ОКВЭД: <span className="text-gray-900 font-mono">{okved}</span>
        </span>
        {name && <span className="text-gray-600 font-normal text-xs break-words">{name}</span>}
      </div>
      <button
        type="button"
        onClick={() => router.push(`/organizations?okved=${encodeURIComponent(prefix)}`)}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors w-full sm:w-auto shrink-0"
      >
        <Search className="w-3.5 h-3.5 shrink-0" /> Похожие по ОКВЭД
      </button>
    </>
  );
});

interface InfoRowProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}

const InfoRow = memo(function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-gray-800 text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  );
});
