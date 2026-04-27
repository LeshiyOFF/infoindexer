/**
 * Port для работы с DuckDuckGo
 *
 * @remarks
 * Определяет контракт для парсинга DDG redirect и извлечения URL.
 * Реализует Dependency Inversion Principle из SOLID.
 */

import type { Page } from 'playwright';

/**
 * Port для работы с DuckDuckGo
 *
 * @remarks
 * Определяет методы для работы с redirect и поиском URL.
 */
export interface IDuckDuckGoService {
  /**
   * Извлекает реальный URL из redirect-ссылки DuckDuckGo
   *
   * @param href - Исходный href (может содержать redirect)
   * @returns Реальный URL или null
   */
  resolveRedirect(href: string): string | null;

  /**
   * Извлекает URL результатов поиска со страницы DDG
   *
   * @param page - Экземпляр Page Playwright
   * @param maxUrls - Максимальное количество URL
   * @returns Массив найденных URL
   */
  extractResultUrls(page: Page, maxUrls: number): Promise<string[]>;

  /**
   * Выполняет поиск с переходом на целевые страницы и извлечением контактов
   *
   * @param page - Экземпляр Page Playwright
   * @param query - Поисковый запрос
   * @param maxUrls - Максимальное количество страниц для перехода
   * @returns Найденные email и телефоны
   */
  searchWithTargetVisit(
    page: Page,
    query: string,
    maxUrls: number
  ): Promise<{ readonly emails: string[]; readonly phones: string[] }>;
}
