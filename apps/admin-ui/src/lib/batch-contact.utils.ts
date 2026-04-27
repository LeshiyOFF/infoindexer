/**
 * Pure Utility Functions для Batch Contacts
 */

import type { BatchInnItem, ContactData, BatchResult, BatchStatus } from '@/components/batches/ports';

export type ContactKind = 'phone' | 'email';
export type ContactRelevanceType = 'direct' | 'general';

export interface ContactItem {
  readonly inn: string;
  readonly name: string;
  readonly director?: string;
  readonly val: string;
  readonly type: ContactRelevanceType;
  readonly source: string;
  readonly kind: ContactKind;
}

export interface CompanyWithoutResult {
  readonly inn: string;
  readonly name: string;
  readonly status: BatchStatus;
  readonly statusLabel: string;
  readonly error?: string;
}

/** Добавляет контакт из данных */
function addContact(
  items: ContactItem[],
  inn: string,
  name: string,
  director: string | undefined,
  val: string,
  type: string | undefined,
  source: string,
  kind: ContactKind
): void {
  items.push({
    inn, name, director, val,
    type: type === 'direct' ? 'direct' : 'general',
    source, kind
  });
}

/** Общий код для flatten */
function flattenFromData(
  items: ContactItem[],
  inn: string,
  name: string,
  director: string | undefined,
  data: ContactData
): void {
  for (const phone of data.phones ?? []) addContact(items, inn, name, director, phone.val, phone.type, phone.source, 'phone');
  for (const email of data.emails ?? []) addContact(items, inn, name, director, email.val, email.type, email.source, 'email');
}

export function flattenContactsFromProgress(
  batchItems: readonly { inn: string; name: string }[],
  batchProgress: Readonly<Record<string, { status: string; data?: ContactData }>>
): readonly ContactItem[] {
  const items: ContactItem[] = [];
  for (const { inn, name } of batchItems) {
    const data = batchProgress[inn]?.data;
    if (data) flattenFromData(items, inn, data.name || name, data.director, data);
  }
  return items;
}

export function flattenContactsFromArchive(
  archiveResults: Readonly<Record<string, BatchResult>>,
  inns: readonly BatchInnItem[]
): readonly ContactItem[] {
  const items: ContactItem[] = [];
  const nameMap = Object.fromEntries(inns.map(x => [x.inn, x.name]));
  for (const [inn, result] of Object.entries(archiveResults)) {
    const data = result.data;
    if (data) flattenFromData(items, inn, data.name || nameMap[inn] || inn, data.director, data);
  }
  return items;
}

export function getCompaniesWithoutResults(
  archiveResults: Readonly<Record<string, BatchResult>>,
  inns: readonly BatchInnItem[]
): readonly CompanyWithoutResult[] {
  const statusLabels: Record<BatchStatus, string> = { completed: 'Завершено', running: 'В процессе', error: 'Ошибка', pending: 'Ожидание', idle: 'Ожидание' };
  return inns.filter(({ inn }) => {
    const r = archiveResults[inn];
    return !r || !r.data || r.status === 'error' || r.status === 'running' || r.status === 'idle';
  }).map(({ inn, name }) => {
    const result = archiveResults[inn];
    const status = result?.status ?? 'idle';
    return { inn, name: name || inn, status, statusLabel: statusLabels[status], error: result?.error };
  });
}

export type FilterType = 'all' | 'mail' | 'phone';
export type FilterRelevance = 'all' | 'relevant' | 'not_relevant';

export function filterContacts(
  contacts: readonly ContactItem[],
  filterType: FilterType,
  filterRelevance: FilterRelevance,
  selectedInn: string | null
): readonly ContactItem[] {
  return contacts.filter(c => {
    if (selectedInn && c.inn !== selectedInn) return false;
    if (filterType === 'mail' && c.kind !== 'email') return false;
    if (filterType === 'phone' && c.kind !== 'phone') return false;
    if (filterRelevance === 'relevant' && c.type !== 'direct') return false;
    if (filterRelevance === 'not_relevant' && c.type === 'direct') return false;
    return true;
  });
}
