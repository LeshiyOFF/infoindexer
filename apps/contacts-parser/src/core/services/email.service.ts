/**
 * Adapter для работы с email
 *
 * @remarks
 * Реализует Port IEmailService для валидации и парсинга email.
 * Использует regex и списки заблокированных доменов.
 */

import {
  BLOCKED_EMAILS,
  BLOCKED_EMAIL_DOMAINS
} from '../constants';
import type { IEmailService } from '../ports/i-email.port';

/** Regex для поиска email в тексте */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Сервис для работы с email
 *
 * @remarks
 * Предоставляет методы для проверки, извлечения и фильтрации email.
 */
export class EmailService implements IEmailService {
  /**
   * Проверяет, является ли email заблокированным
   *
   * @param email - Email адрес
   * @returns true если email заблокирован
   */
  isBlocked(email: string): boolean {
    const lower = email.toLowerCase();

    // Проверка по шаблонам
    if (BLOCKED_EMAILS.some(block => lower.includes(block))) {
      return true;
    }

    // Проверка по доменам
    const domain = lower.split('@')[1];
    if (domain) {
      return BLOCKED_EMAIL_DOMAINS.some(
        d => domain === d || domain.endsWith('.' + d)
      );
    }

    return false;
  }

  /**
   * Извлекает email адреса из текста
   *
   * @param text - Текст для поиска
   * @returns Массив найденных email
   */
  extract(text: string): string[] {
    const matches = text.match(EMAIL_REGEX);
    return matches || [];
  }

  /**
   * Фильтрует массив email, убирая заблокированные
   *
   * @param emails - Массив email для фильтрации
   * @returns Отфильтрованный массив
   */
  filterBlocked(emails: readonly string[]): string[] {
    return emails.filter(email => !this.isBlocked(email));
  }
}
