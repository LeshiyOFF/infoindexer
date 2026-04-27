import { memo } from 'react';
import { Phone, Mail } from 'lucide-react';
import { PhoneItem, EmailItem, ContactsSourceMap, ContactsUrl } from './ContactItems';

interface OSINTContacts {
  readonly emails: { readonly val: string; readonly source: string; readonly type?: 'direct' | 'official' | 'general' | 'verified' }[];
  readonly phones: { readonly val: string; readonly source: string; readonly type?: 'direct' | 'official' | 'general' | 'verified' }[];
  readonly sourcesChecked?: { readonly name: string; readonly found: boolean; readonly status: 'completed' | 'error' | 'skipped' }[];
  readonly url?: string;
}

interface ContactsDataProps {
  readonly contacts: OSINTContacts;
}

export const ContactsData = memo(function ContactsData({ contacts }: ContactsDataProps) {
  return (
    <>
      {contacts.phones.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Phone className="w-3 h-3" /> Телефоны
          </div>
          <div className="flex flex-col gap-2.5">
            {contacts.phones
              .sort((a, b) => {
                const order = { direct: 0, verified: 1, official: 2, general: 3 };
                return (order[a.type || 'general'] || 9) - (order[b.type || 'general'] || 9);
              })
              .map((p, i) => (
                <PhoneItem key={i} phone={p} />
              ))}
          </div>
        </div>
      )}
      {contacts.emails.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Mail className="w-3 h-3" /> Электронная почта
          </div>
          <div className="flex flex-col gap-2">
            {contacts.emails.map((e, i) => (
              <EmailItem key={i} email={e} />
            ))}
          </div>
        </div>
      )}
      {contacts.sourcesChecked && <ContactsSourceMap sourcesChecked={contacts.sourcesChecked} />}
      {contacts.emails.length === 0 && contacts.phones.length === 0 && (
        <p className="text-gray-400 text-sm italic py-4">Личные контакты директора по ФИО не обнаружены</p>
      )}
      {contacts.url && <ContactsUrl url={contacts.url} />}
    </>
  );
});
