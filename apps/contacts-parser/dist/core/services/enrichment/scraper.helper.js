"use strict";
/**
 * Helper для scraping стадий
 *
 * @remarks
 * Выносит логику парсинга Checko, DDG и официального сайта.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperHelper = void 0;
const shared_1 = require("shared");
const constants_1 = require("../../constants");
/**
 * Helper для выполнения scraping стадий
 *
 * @remarks
 * Содержит логику парсинга различных источников.
 */
class ScraperHelper {
    email;
    phone;
    constructor(email, phone) {
        this.email = email;
        this.phone = phone;
    }
    /**
     * Парсит сайт Checko
     *
     * @param inn - ИНН организации
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    async scrapeChecko(inn, page, contacts, addSource) {
        try {
            console.log('[Waterfall] Checko...');
            await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'running', stage: '1/21: Checko' });
            await page.goto(`https://checko.ru/company/${inn}`, { waitUntil: 'domcontentloaded' });
            const body = await page.innerText('body');
            let foundInChecko = false;
            if (!body.includes('CAPTCHA')) {
                if (!contacts.name) {
                    contacts.name = await page.locator('h1').innerText().catch(() => '');
                }
                if (!contacts.directorName) {
                    const dirLoc = page.locator('text="Руководитель"').locator('..').locator('a');
                    if (await dirLoc.count() > 0) {
                        contacts.directorName = await dirLoc.first().innerText();
                    }
                }
                const emails = this.email.extract(body);
                const phones = this.phone.extract(body);
                if (emails.length > 0 || phones.length > 0) {
                    foundInChecko = true;
                }
                this.email.filterBlocked(emails).forEach(e => contacts.emails.push({ val: e, source: 'Checko', type: 'official' }));
                phones.forEach(p => contacts.phones.push({ val: p, source: 'Checko', type: 'official' }));
            }
            addSource('Checko', foundInChecko);
        }
        catch (e) {
            console.error('[Waterfall] Checko error:', e);
            addSource('Checko', false, 'error');
        }
    }
    /**
     * Ищет компанию в DuckDuckGo
     *
     * @param inn - ИНН организации
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    async searchCompanyOnDDG(inn, page, contacts, addSource) {
        try {
            console.log('[Waterfall] DuckDuckGo (Company)...');
            await shared_1.redisClient.hset(`contacts:status:${inn}`, {
                status: 'running',
                stage: '2/21: DuckDuckGo (Компания)'
            });
            await page.goto(`https://html.duckduckgo.com/html/?q=ИНН+${inn}+контакты`, {
                waitUntil: 'domcontentloaded'
            });
            const body = await page.innerText('body');
            const emails = this.email.extract(body);
            const phones = this.phone.extract(body);
            this.email.filterBlocked(emails).forEach(e => contacts.emails.push({ val: e, source: 'Поиск (Организация)', type: 'general' }));
            phones.forEach(p => contacts.phones.push({ val: p, source: 'Поиск (Организация)', type: 'general' }));
            const site = await page.evaluate(() => Array.from(document.querySelectorAll('.result__url'))
                .map(el => el.textContent?.trim() || '')
                .find(l => !l.includes('checko') && !l.includes('rusprofile') && !l.includes('sbis')));
            if (site) {
                contacts.websites.push(site);
            }
            addSource('DuckDuckGo (Компания)', emails.length > 0 || phones.length > 0 || !!site);
        }
        catch (e) {
            console.error('[Waterfall] DuckDuckGo (Компания) error:', e);
            addSource('DuckDuckGo (Компания)', false, 'error');
        }
    }
    /**
     * Парсит официальный сайт компании
     *
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    async scrapeOfficialSite(page, contacts, addSource) {
        if (contacts.websites.length === 0) {
            addSource('Официальный сайт', false, 'skipped');
            return;
        }
        try {
            const url = contacts.websites[0].includes('http')
                ? contacts.websites[0]
                : `http://${contacts.websites[0]}`;
            console.log(`[Waterfall] Site ${url}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: constants_1.PAGE_TIMEOUT_MS });
            const body = await page.innerText('body');
            const emails = this.email.extract(body);
            const phones = this.phone.extract(body);
            this.email.filterBlocked(emails).forEach(e => contacts.emails.push({ val: e, source: 'Офиц. сайт', type: 'verified' }));
            phones.forEach(p => contacts.phones.push({ val: p, source: 'Офиц. сайт', type: 'verified' }));
            addSource('Официальный сайт', emails.length > 0 || phones.length > 0);
        }
        catch (e) {
            console.error('[Waterfall] Официальный сайт error:', e);
            addSource('Официальный сайт', false, 'error');
        }
    }
}
exports.ScraperHelper = ScraperHelper;
