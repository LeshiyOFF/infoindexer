/**
 * Adapter для работы с DuckDuckGo
 *
 * @remarks
 * Реализует Port IDuckDuckGoService для парсинга DDG.
 * Обрабатывает redirect ссылки и извлекает URL из результатов поиска.
 */
import type { EmailService } from './email.service';
import type { PhoneService } from './phone.service';
import type { Page } from 'playwright';
import type { IDuckDuckGoService } from '../ports/i-duckduckgo.port';
/**
 * Сервис для работы с DuckDuckGo
 *
 * @remarks
 * Предоставляет методы для работы с DDG redirect и поиском.
 */
export declare class DuckDuckGoService implements IDuckDuckGoService {
    private readonly email;
    private readonly phone;
    constructor(email: EmailService, phone: PhoneService);
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
    searchWithTargetVisit(page: Page, query: string, maxUrls: number): Promise<{
        readonly emails: string[];
        readonly phones: string[];
    }>;
}
