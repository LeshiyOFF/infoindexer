import { memo } from 'react';
import { Loader2, DownloadCloud } from 'lucide-react';

interface ContactsRequestorProps {
  readonly status: 'idle' | 'running' | 'completed' | 'error';
  readonly stage: string;
  readonly director: string | null;
  readonly onRequest: () => void;
}

export const ContactsRequestor = memo(function ContactsRequestor({ status, stage, director, onRequest }: ContactsRequestorProps) {
  if (status === 'running') {
    const match = stage.match(/(\d+)\/(\d+)/);
    const progress = match ? Math.round((parseInt(match[1]) / parseInt(match[2])) * 100) : 0;
    const currentStep = match ? parseInt(match[1]) : 0;

    return (
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>Прогресс поиска</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gray-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-white leading-tight">{stage || 'Инициализация...'}</p>
            <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter">Поиск по ФИО «{director ?? 'Не указан'}». LinkedIn, VK — личные контакты</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 opacity-60">
          {Array.from({ length: 21 }).map((_, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;
            return <div key={i} className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-gray-500' : isCurrent ? 'bg-gray-400' : 'bg-gray-700'}`} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <p className="text-gray-400 text-sm mb-6">Личные контакты директора (телефон/email по ФИО) не загружены.</p>
      <button onClick={onRequest} className="w-full bg-white text-gray-900 py-3 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg">
        <DownloadCloud className="w-4 h-4" /> Обогатить данные
      </button>
    </div>
  );
});
