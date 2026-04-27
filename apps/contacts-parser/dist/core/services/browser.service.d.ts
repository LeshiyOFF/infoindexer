/**
 * Adapter для управления браузером
 *
 * @remarks
 * Реализует Port IBrowserService для Playwright chromium.
 * Управляет жизненным циклом браузера (singleton pattern).
 */
import type { Browser, BrowserContext } from 'playwright';
import type { IBrowserService, BrowserContextOptions } from '../ports/i-browser.port';
/**
 * Сервис для управления браузером
 *
 * @remarks
 * Использует singleton pattern для переиспользования браузера.
 */
export declare class BrowserService implements IBrowserService {
    private browser;
    /**
     * Получает или создаёт экземпляр браузера
     *
     * @returns Экземпляр браузера
     */
    getBrowser(): Promise<Browser>;
    /**
     * Создаёт новый контекст браузера
     *
     * @param options - Параметры контекста
     * @returns Новый контекст браузера
     */
    createContext(options?: BrowserContextOptions): Promise<BrowserContext>;
    /**
     * Закрывает браузер
     */
    close(): Promise<void>;
}
