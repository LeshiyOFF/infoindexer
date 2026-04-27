"use strict";
/**
 * Adapter для управления браузером
 *
 * @remarks
 * Реализует Port IBrowserService для Playwright chromium.
 * Управляет жизненным циклом браузера (singleton pattern).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserService = void 0;
const playwright_extra_1 = require("playwright-extra");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
playwright_extra_1.chromium.use((0, puppeteer_extra_plugin_stealth_1.default)());
/**
 * Сервис для управления браузером
 *
 * @remarks
 * Использует singleton pattern для переиспользования браузера.
 */
class BrowserService {
    browser = null;
    /**
     * Получает или создаёт экземпляр браузера
     *
     * @returns Экземпляр браузера
     */
    async getBrowser() {
        if (this.browser) {
            return this.browser;
        }
        this.browser = await playwright_extra_1.chromium.launch({
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
    async createContext(options) {
        const browser = await this.getBrowser();
        return browser.newContext({
            userAgent: options?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
    }
    /**
     * Закрывает браузер
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
exports.BrowserService = BrowserService;
