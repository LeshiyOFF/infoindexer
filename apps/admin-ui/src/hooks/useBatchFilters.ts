/**
 * Hook для управления фильтрами контактов
 *
 * @remarks
 * Вынесено из BatchResultsFeed для DRY.
 * Содержит state и логику фильтрации.
 */

"use client";

import { useCallback, useMemo, useState } from 'react';
import {
  filterContacts,
  type FilterType,
  type FilterRelevance,
  type ContactItem
} from '@/lib/batch-contact.utils';

/**
 * Hook для управления фильтрами контактов
 *
 * @param contacts - Список контактов для фильтрации
 * @returns Фильтры и отфильтрованные контакты
 */
export function useBatchFilters(contacts: readonly ContactItem[]) {
  // State
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterRelevance, setFilterRelevance] = useState<FilterRelevance>('all');
  const [selectedCompanyInn, setSelectedCompanyInn] = useState<string | null>(null);

  /**
   * Отфильтрованные контакты
   */
  const filteredContacts = useMemo(() => {
    return filterContacts(contacts, filterType, filterRelevance, selectedCompanyInn);
  }, [contacts, filterType, filterRelevance, selectedCompanyInn]);

  /**
   * Сбрасывает фильтр по компании
   */
  const clearCompanyFilter = useCallback(() => {
    setSelectedCompanyInn(null);
  }, []);

  return {
    filterType,
    setFilterType,
    filterRelevance,
    setFilterRelevance,
    selectedCompanyInn,
    setSelectedCompanyInn,
    clearCompanyFilter,
    filteredContacts
  };
}
