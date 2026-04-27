import { memo } from 'react';
import { Globe } from 'lucide-react';

interface PhoneItemProps {
  readonly phone: { readonly val: string; readonly source: string; readonly type?: string };
}

export const PhoneItem = memo(function PhoneItem({ phone }: PhoneItemProps) {
  const isDirect = phone.type === 'direct';
  return (
    <div className={`flex flex-col bg-white/10 p-4 rounded-2xl border ${isDirect ? 'border-gray-500/50 bg-gray-500/20' : 'border-white/5'} group/phone hover:bg-white/15 transition-all gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <a href={`tel:${phone.val}`} className={`font-mono text-base font-black ${isDirect ? 'text-gray-300' : 'text-white'} hover:text-gray-400 transition-colors`}>
            {phone.val}
          </a>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {phone.source.split(', ').map((s, si) => (
              <span key={si} className="text-[8px] font-black uppercase bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5 tracking-widest">
                {s}
              </span>
            ))}
            {isDirect && <span className="text-[8px] font-bold text-gray-400 uppercase self-center">~80% личный</span>}
          </div>
        </div>
        {isDirect && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold uppercase bg-gray-600 text-white px-2 py-0.5 rounded">Найден по ФИО</span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-400 leading-tight font-medium bg-black/20 p-2 rounded-lg border border-white/5">
        {getPhoneDescription(phone.type)}
      </p>
    </div>
  );
});

interface EmailItemProps {
  readonly email: { readonly val: string; readonly source: string; readonly type?: string };
}

export const EmailItem = memo(function EmailItem({ email }: EmailItemProps) {
  return (
    <div className="flex flex-col bg-white/10 p-3 rounded-xl border border-white/5 hover:bg-white/15 transition-all gap-1.5">
      <div className="flex items-center justify-between">
        <a href={`mailto:${email.val}`} className="text-[11px] text-white hover:text-gray-300 transition-colors truncate max-w-[150px] font-bold">
          {email.val}
        </a>
        <div className="flex gap-1">
          {email.source.split(', ').map((s, si) => (
            <span key={si} className="text-[8px] font-black uppercase bg-white/5 text-gray-500 px-1.5 py-0.5 rounded text-gray-500 border border-white/5">
              {s}
            </span>
          ))}
        </div>
      </div>
      {email.type === 'direct' && <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Личный email руководителя</p>}
    </div>
  );
});

interface ContactsSourceMapProps {
  readonly sourcesChecked: readonly { readonly name: string; readonly found: boolean }[];
}

export const ContactsSourceMap = memo(function ContactsSourceMap({ sourcesChecked }: ContactsSourceMapProps) {
  return (
    <div className="pt-4 border-t border-white/5">
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Карта источников</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {sourcesChecked.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${s.found ? 'bg-gray-500' : 'bg-gray-700'}`} />
            <span className={`text-[9px] font-bold uppercase tracking-tight ${s.found ? 'text-gray-300' : 'text-gray-600'}`}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

interface ContactsUrlProps {
  readonly url: string;
}

export const ContactsUrl = memo(function ContactsUrl({ url }: ContactsUrlProps) {
  const hostname = (() => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors mt-4">
      <Globe className="w-3 h-3" /> ИСТОЧНИК ДАННЫХ: {hostname}
    </a>
  );
});

function getPhoneDescription(type: string | undefined): string {
  if (type === 'direct') return 'Найден по ФИО в LinkedIn/VK/OSINT. Высокая вероятность личного контакта директора.';
  if (type === 'verified') return 'С сайта компании. Юридический контакт, не личный — низкая релевантность для связи с ЛПР.';
  if (type === 'official') return 'Из реестров (ФНС/ККТ). Контакт организации.';
  return 'Из открытых агрегаторов. Справочно.';
}
