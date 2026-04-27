import { memo, useCallback, useEffect, useState } from 'react';
import { ContactsData } from './ContactsData';
import { ContactsRequestor } from './ContactsRequestor';
import { getAuthHeaders } from '@/lib/api';

interface OSINTContacts {
  readonly emails: { readonly val: string; readonly source: string; readonly type?: 'direct' | 'official' | 'general' | 'verified' }[];
  readonly phones: { readonly val: string; readonly source: string; readonly type?: 'direct' | 'official' | 'general' | 'verified' }[];
  readonly sourcesChecked?: { readonly name: string; readonly found: boolean; readonly status: 'completed' | 'error' | 'skipped' }[];
  readonly url?: string;
  readonly director?: string;
}

interface ContactsSectionProps {
  readonly organizationId: string;
  readonly director: string;
  readonly onStatusChange?: (status: 'idle' | 'running' | 'completed' | 'error') => void;
  readonly onContactsChange?: (contacts: OSINTContacts | null) => void;
}

type ContactsStatus = 'idle' | 'running' | 'completed' | 'error';

export const ContactsSection = memo(function ContactsSection({ organizationId, director, onStatusChange, onContactsChange }: ContactsSectionProps) {
  const [contacts, setContacts] = useState<OSINTContacts | null>(null);
  const [status, setStatus] = useState<ContactsStatus>('idle');
  const [stage, setStage] = useState('');

  const fetchContactsStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/contacts`, { headers: getAuthHeaders() });
      const json = await res.json() as { status: string; stage?: string; data?: OSINTContacts };
      const newStatus = json.status as ContactsStatus;
      setStatus(newStatus);
      if (json.stage) setStage(json.stage);
      if (newStatus === 'completed' && json.data) {
        setContacts(json.data);
        onContactsChange?.(json.data);
      }
      onStatusChange?.(newStatus);
    } catch {
      // ignore fetch errors
    }
  }, [organizationId, onStatusChange, onContactsChange]);

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(fetchContactsStatus, 2000);
    return () => clearInterval(interval);
  }, [status, fetchContactsStatus]);

  useEffect(() => {
    fetchContactsStatus();
  }, [fetchContactsStatus]);

  const requestContacts = useCallback(async () => {
    if (status === 'running') return;
    setStatus('running');
    onStatusChange?.('running');
    try {
      const res = await fetch(`/api/organizations/${organizationId}/contacts`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Auth failed');
      setTimeout(fetchContactsStatus, 3000);
    } catch {
      setStatus('error');
      onStatusChange?.('error');
    }
  }, [organizationId, status, fetchContactsStatus, onStatusChange]);

  return (
    <div className="bg-gray-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Личные контакты директора (OSINT по ФИО)</h3>
            <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter">LinkedIn, VK по имени ≈ 80% личный • Сайт компании ≈ 0%</p>
          </div>
          {contacts?.sourcesChecked && (
            <div className="flex gap-1">
              {contacts.sourcesChecked.map((s, i) => (
                <div key={i} title={`${s.name}: ${s.found ? 'Найдено' : 'Не найдено'}`} className={`w-1.5 h-1.5 rounded-full ${s.found ? 'bg-gray-500' : s.status === 'error' ? 'bg-gray-600' : 'bg-gray-700'}`} />
              ))}
            </div>
          )}
        </div>

        {contacts ? <ContactsData contacts={contacts} /> : <ContactsRequestor status={status} stage={stage} director={director} onRequest={requestContacts} />}
      </div>
    </div>
  );
});
