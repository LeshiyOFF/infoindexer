/**
 * Adapter для управления браузером
 *
 * @remarks
 * Реализует Port IBrowserService для Playwright chromium.
 * Управляет жизненным циклом браузера (singleton pattern).
 */

import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, BrowserContext } from 'playwright';
import type { IBrowserService, BrowserContextOptions } from '../ports/i-browser.port';

chromium.use(StealthPlugin());

/**
 * Сервис для управления браузером
 *
 * @remarks
 * Использует singleton pattern для переиспользования браузера.
 */
export class BrowserService implements IBrowserService {
  private browser: Browser | null = null;

  /**
   * Получает или создаёт экземпляр браузера
   *
   * @returns Экземпляр браузера
   */
  async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    return this.browser;
  }

  /**
   * Создаёт новый контекст браузера
   *
   * @param options - Параметры контекста
   * @returns Новый контекст браузера
   */
  async createContext(options?: BrowserContextOptions): Promise<BrowserContext> {
    const browser = await this.getBrowser();
    return browser.newContext({
      userAgent: options?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }

  /**
   * Закрывает браузер
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
