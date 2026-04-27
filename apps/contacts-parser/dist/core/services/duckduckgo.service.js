"use strict";
/**
 * Adapter для работы с DuckDuckGo
 *
 * @remarks
 * Реализует Port IDuckDuckGoService для парсинга DDG.
 * Обрабатывает redirect ссылки и извлекает URL из результатов поиска.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDuckGoService = void 0;
const delay_util_1 = require("./delay.util");
const constants_1 = require("../constants");
/**
 * Сервис для работы с DuckDuckGo
 *
 * @remarks
 * Предоставляет методы для работы с DDG redirect и поиском.
 */
class DuckDuckGoService {
    email;
    phone;
    constructor(email, phone) {
        this.email = email;
        this.phone = phone;
    }
    /**
     * Извлекает реальный URL из redirect-ссылки DuckDuckGo
     *
     * @param href - Исходный href (может содержать redirect)
     * @returns Реальный URL или null
     */
    resolveRedirect(href) {
        if (!href || typeof href !== 'string') {
            return null;
        }
        const trimmed = href.trim();
        if (!trimmed) {
            return null;
        }
        // Если href уже ведёт на внешний домен (не duckduckgo), вернуть как есть
        try {
            const lower = trimmed.toLowerCase();
            if (!lower.includes('duckduckgo.com') && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
                return trimmed;
            }
            if (trimmed.startsWith('//')) {
                const withProtocol = 'https:' + trimmed;
                if (!withProtocol.includes('duckduckgo.com')) {
                    return withProtocol;
                }
            }
        }
        catch {
            return null;
        }
        // Парсинг uddg параметра
        try {
            const uddgMatch = trimmed.match(/[?&]uddg=([^&]+)/);
            if (uddgMatch) {
                const decoded = decodeURIComponent(uddgMatch[1]);
                if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
                    return decoded;
                }
                return 'https://' + decoded.replace(/^\/+/, '');
            }
            return null;
        }
        catch {
            return null;
        }
    }
    /**
     * Извлекает URL результатов поиска со страницы DDG
     *
     * @param page - Экземпляр Page Playwright
     * @param maxUrls - Максимальное количество URL
     * @returns Массив найденных URL
     */
    async extractResultUrls(page, maxUrls) {
        const rawHrefs = await page.evaluate(() => {
            const links = [];
            // Ссылки в результатах DDG: .result a (href может быть uddg redirect или прямой)
            const anchors = document.querySelectorAll('.result a[href], a.result__a[href], .result__url[href]');
            anchors.forEach((a) => {
                const el = a;
                const href = el.href || el.getAttribute?.('href');
                if (href && href.trim()) {
                    links.push(href);
                }
            });
            return links;
        });
        const resolved = new Set();
        for (const href of rawHrefs) {
            const url = this.resolveRedirect(href);
            if (!url) {
                continue;
            }
            const lower = url.toLowerCase();
            const isBlocked = constants_1.BLOCKED_DOMAINS.some((d) => lower.includes(d));
            if (isBlocked) {
                continue;
            }
            resolved.add(url);
            if (resolved.size >= maxUrls) {
                break;
            }
        }
        return Array.from(resolved);
    }
    /**
     * Выполняет поиск с переходом на целевые страницы и извлечением контактов
     *
     * @param page - Экземпляр Page Playwright
     * @param query - Поисковый запрос
     * @param maxUrls - Максимальное количество страниц для перехода
     * @returns Найденные email и телефоны
     */
    async searchWithTargetVisit(page, query, maxUrls) {
        const allEmails = new Set();
        const allPhones = new Set();
        try {
            await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
                waitUntil: 'domcontentloaded'
            });
            const body = await page.innerText('body');
            // 1. Парсинг сниппетов DDG (fallback)
            this.email.extract(body).forEach(e => allEmails.add(e));
            this.phone.extract(body).forEach(p => allPhones.add(p));
            // 2. Извлечение URL и переход на целевые страницы
            const urls = await this.extractResultUrls(page, maxUrls);
            for (const url of urls) {
                try {
                    await (0, delay_util_1.delay)(constants_1.TARGET_PAGE_DELAY_MS);
                    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                    await page.goto(fullUrl, {
                        waitUntil: 'domcontentloaded',
                        timeout: constants_1.TARGET_PAGE_TIMEOUT_MS
                    });
                    const targetBody = await page.innerText('body');
                    if (targetBody.includes('CAPTCHA')) {
                        continue;
                    }
                    this.email.extract(targetBody).forEach(e => allEmails.add(e));
                    this.phone.extract(targetBody).forEach(p => allPhones.add(p));
                }
                catch (err) {
                    console.warn(`[DDG] Target page ${url.slice(0, 50)}... skip:`, err.message);
                }
            }
        }
        catch (e) {
            console.error(`[DDG] searchWithTargetVisit error:`, e);
        }
        return {
            emails: Array.from(allEmails),
            phones: Array.from(allPhones)
        };
    }
}
exports.DuckDuckGoService = DuckDuckGoService;
