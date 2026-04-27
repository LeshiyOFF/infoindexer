/**
 * OKVED (Общероссийский классификатор видов экономической деятельности)
 * Domain Layer — Types + Helper Functions
 *
 * @remarks
 * Данные вынесены в: data/okved.data.ts
 */

import { OKVED_CLASSES } from './data/okved.data';

/** Value Object: ОКВЭД код + наименование */
export interface OkvedOption {
  code: string;
  name: string;
}

/** Алиас для combobox: полная таблица классов с наименованиями */
export const OKVED_OPTIONS = OKVED_CLASSES;

/**
 * Возвращает наименование по коду ОКВЭД (точное совпадение или наиболее подходящий префикс).
 * @example getOkvedName("62.01.11") // → "Разработка компьютерного программного обеспечения"
 */
export function getOkvedName(code: string | null | undefined): string | undefined {
  if (!code || typeof code !== 'string') return undefined;
  const trimmed = code.trim();
  if (!trimmed) return undefined;

  const exact = OKVED_CLASSES.find((o) => o.code === trimmed);
  if (exact) return exact.name;

  const parts = trimmed.split('.');
  for (let i = parts.length; i >= 1; i--) {
    const prefix = parts.slice(0, i).join('.');
    const found = OKVED_CLASSES.find((o) => o.code === prefix);
    if (found) return found.name;
  }

  return undefined;
}

/**
 * Извлекает префикс подкласса ОКВЭД для фильтрации.
 * @example extractOkvedSubclassPrefix("62.01.11") // → "62.01"
 */
export function extractOkvedSubclassPrefix(okved: string | null | undefined): string {
  if (!okved || typeof okved !== 'string') return '';
  const match = okved.match(/^(\d{2}(\.\d{1,2})?)/);
  return match ? match[1] : okved;
}
