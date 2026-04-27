/**
 * Сервис для приоритизации контактов
 *
 * @remarks
 * Реализует Port IContactPrioritizer для дедупликации и сортировки.
 * Удаляет дубликаты и объединяет источники для одинаковых контактов.
 */

import type { ContactItem } from '../types/contacts.types';
import type { IContactPrioritizer } from '../ports/i-enrichment.port';
import type { EmailService } from './email.service';
import type { PhoneService } from './phone.service';

/**
 * Расширенный элемент контакта с временным хранилищем источников
 */
interface ContactItemWithSources extends ContactItem {
  readonly allSources: string[];
}

/**
 * Сервис для приоритизации контактов
 *
 * @remarks
 * Объединяет дубликаты и сортирует по типу (direct > verified > official > general).
 */
export class ContactPrioritizer implements IContactPrioritizer {
  constructor(
    private readonly email: EmailService,
    private readonly phone: PhoneService
  ) {}

  /**
   * Удаляет дубликаты и сортирует контакты по приоритету
   *
   * @param items - Массив контактов
   * @returns Массив уникальных контактов с объединёнными источниками
   */
  prioritize(items: ReadonlyArray<ContactItem>): ContactItem[] {
    const typePriority: Record<string, number> = {
      direct: 0,
      verified: 1,
      official: 2,
      general: 3
    };

    const map = new Map<string, ContactItemWithSources>();

    for (const item of items) {
      const existing = map.get(item.val);
      const currentPriority = typePriority[item.type || 'general'] ?? 9;
      const existingPriority = existing ? (typePriority[existing.type || 'general'] ?? 9) : 99;

      if (!existing || currentPriority < existingPriority) {
        map.set(item.val, {
          ...item,
          allSources: existing ? [...new Set([...existing.allSources, item.source])] : [item.source]
        });
      } else {
        // Если существующий лучше или такой же, добавляем источник
        const updated = existing as ContactItemWithSources & { allSources: string[] };
        updated.allSources = [...new Set([...updated.allSources, item.source])];
      }
    }

    return Array.from(map.values()).map(item => ({
      val: item.val,
      source: item.allSources.join(', '),
      type: item.type
    }));
  }

  /**
   * Фильтрует и приоритизирует email контакты
   *
   * @param items - Массив email контактов
   * @returns Отфильтрованный и приоритизированный массив
   */
  prioritizeEmails(items: ReadonlyArray<ContactItem>): ContactItem[] {
    const filtered = items.filter(item => !this.email.isBlocked(item.val));
    return this.prioritize(filtered);
  }

  /**
   * Фильтрует и приоритизирует телефонные контакты
   *
   * @param items - Массив телефонных контактов
   * @returns Отфильтрованный и приоритизированный массив
   */
  prioritizePhones(items: ReadonlyArray<ContactItem>): ContactItem[] {
    const filtered = items.filter(item => this.phone.isValidLength(item.val));
    return this.prioritize(filtered);
  }
}
