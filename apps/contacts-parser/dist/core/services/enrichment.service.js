"use strict";
/**
 * Adapter для обогащения контактной информации
 *
 * @remarks
 * Реализует Port IEnrichmentService для OSINT обогащения.
 * Координирует работу всех сервисов для сбора контактных данных.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentService = void 0;
const shared_1 = require("shared");
const constants_1 = require("../constants");
/**
 * Сервис для обогащения контактной информации
 *
 * @remarks
 * Выполняет многоэтапный OSINT поиск контактов организации.
 */
class EnrichmentService {
    browser;
    ddg;
    email;
    phone;
    prioritizer;
    constructor(browser, ddg, email, phone, prioritizer) {
        this.browser = browser;
        this.ddg = ddg;
        this.email = email;
        this.phone = phone;
        this.prioritizer = prioritizer;
    }
    /**
     * Получает обогащённую контактную информацию по ИНН
     *
     * @param inn - ИНН организации
     * @param batchId - Опциональный ID батча
     * @returns Обогащённая контактная информация
     */
    async getEnrichedData(inn, batchId) {
        let context = null;
        const contacts = {
            emails: [],
            phones: [],
            websites: [],
            sourcesChecked: []
        };
        const addSource = (name, found, status = 'completed') => {
            contacts.sourcesChecked.push({ name, found, status });
        };
        try {
            context = await this.browser.createContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });
            console.log(`[Waterfall] Enrichment INN: ${inn}`);
            await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'running' });
            // Стадия 0: Получение данных из ClickHouse
            await this.fetchFromClickHouse(inn, contacts, addSource);
            const page = await context.newPage();
            page.setDefaultTimeout(constants_1.PAGE_TIMEOUT_MS);
            // Стадия 1: Checko
            await this.scrapeChecko(inn, page, contacts, addSource);
            // Стадия 2: DuckDuckGo (Компания)
            await this.searchCompanyOnDDG(inn, page, contacts, addSource);
            // Стадия 3: Официальный сайт
            await this.scrapeOfficialSite(page, contacts, addSource);
            // Стадии 4-16: OSINT по директору
            if (contacts.directorName) {
                await this.osintDirector(inn, page, contacts, contacts.directorName, contacts.name || '', addSource);
            }
            else {
                this.skipDirectorStages(addSource);
            }
            // Стадии 17-19: Реестры по ИНН
            await this.searchRegistries(inn, page, contacts, addSource);
            // Финальная обработка
            const result = this.buildFinalResult(contacts);
            await this.saveResult(inn, batchId, result);
            return result;
        }
        catch (err) {
            await this.handleError(inn, batchId, err);
            throw err;
        }
        finally {
            if (context) {
                await context.close();
            }
        }
    }
    /**
     * Получает данные из ClickHouse
     */
    async fetchFromClickHouse(inn, contacts, addSource) {
        try {
            const chResult = await shared_1.clickhouseClient.query({
                query: 'SELECT any(director) as director, any(name) as name FROM companies_meta WHERE inn = {inn: String}',
                query_params: { inn },
                format: 'JSONEachRow'
            });
            const rows = await chResult.json();
            if (rows && rows.length > 0) {
                if (rows[0].director) {
                    contacts.directorName = rows[0].director;
                }
                if (rows[0].name) {
                    contacts.name = rows[0].name;
                }
            }
            addSource('Внутренняя БД', !!(contacts.directorName || contacts.name));
        }
        catch (e) {
            console.error('[Waterfall] ClickHouse error:', e);
            addSource('Внутренняя БД', false, 'error');
        }
    }
    /**
     * Парсит сайт Checko
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
     */
    async searchCompanyOnDDG(inn, page, contacts, addSource) {
        try {
            console.log('[Waterfall] DuckDuckGo (Company)...');
            await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'running', stage: '2/21: DuckDuckGo (Компания)' });
            await page.goto(`https://html.duckduckgo.com/html/?q=ИНН+${inn}+контакты`, { waitUntil: 'domcontentloaded' });
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
            await page.goto(url, { waitUntil: 'domcontentloaded' });
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
    /**
     * Выполняет OSINT поиск по директору
     */
    async osintDirector(inn, page, contacts, directorName, companyName, addSource) {
        const stages = [
            { n: 4, label: 'ОСИНТ (Директор)', query: `"${directorName}" ${companyName ? `"${companyName}"` : ''} телефон email -site:checko.ru -site:rusprofile.ru -site:sbis.ru` },
            { n: 5, label: 'DDG расширенный', query: `"${directorName}" email OR телефон -site:checko.ru -site:rusprofile.ru -site:sbis.ru -site:rbc.ru` },
            { n: 6, label: 'VK', query: `site:vk.com "${directorName}"` },
            { n: 7, label: 'LinkedIn', query: `site:linkedin.com/in "${directorName}" ${companyName ? `"${companyName}"` : ''}` },
            { n: 8, label: 'Telegram', query: `"${directorName}" telegram OR t.me` },
            { n: 9, label: 'Госзакупки', query: `site:zakupki.gov.ru "${directorName}"` },
            { n: 10, label: 'HH.ru', query: `site:hh.ru "${directorName}" директор` },
            { n: 11, label: 'Executive.ru', query: `site:executive.ru "${directorName}"` },
            { n: 12, label: 'Rating.gd.ru', query: `site:rating.gd.ru "${directorName}"` },
            { n: 13, label: 'Конференции', query: `"${directorName}" конференция спикер контакт` },
            { n: 14, label: 'Судебные реестры', query: `site:kad.arbitr.ru OR site:sudact.ru "${directorName}"` },
            { n: 15, label: 'Реестр АУ', query: `site:fedresurs.ru OR site:tbankrot.ru "${directorName}"` },
            { n: 16, label: 'Habr Career', query: `site:career.habr.com "${directorName}"` },
            { n: 17, label: 'Ассоциации', query: `"${directorName}" ${companyName ? `"${companyName}"` : ''} ассоциация союз член контакт` }
        ];
        for (const s of stages) {
            try {
                console.log(`[Waterfall] ${s.label}: ${directorName}...`);
                await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'running', stage: `${s.n}/21: ${s.label}` });
                const { emails, phones } = await this.ddg.searchWithTargetVisit(page, s.query, 5);
                this.email.filterBlocked(emails).forEach(e => contacts.emails.push({ val: e, source: s.label, type: 'direct' }));
                phones.filter(p => this.phone.isValidLength(p)).forEach(p => contacts.phones.push({ val: p, source: s.label, type: 'direct' }));
                addSource(s.label, emails.length > 0 || phones.length > 0);
            }
            catch (e) {
                console.error(`[Waterfall] ${s.label} error:`, e);
                addSource(s.label, false, 'error');
            }
        }
    }
    /**
     * Пропускает стадии по директору (если не найден)
     */
    skipDirectorStages(addSource) {
        const stages = [
            'ОСИНТ (Директор)', 'DDG расширенный', 'VK', 'LinkedIn', 'Telegram',
            'Госзакупки', 'HH.ru', 'Executive.ru', 'Rating.gd.ru', 'Конференции',
            'Судебные реестры', 'Реестр АУ', 'Habr Career', 'Ассоциации'
        ];
        stages.forEach(l => addSource(l, false, 'skipped'));
    }
    /**
     * Ищет в реестрах по ИНН
     */
    async searchRegistries(inn, page, contacts, addSource) {
        const stages = [
            { label: 'ЕФРСБ', stage: '18/21: ЕФРСБ', query: `site:bankrot.fedresurs.ru "${inn}" контакты` },
            { label: 'Росаккредитация', stage: '19/21: Росаккредитация', query: `site:pub.fsa.gov.ru "${inn}" телефон` },
            { label: 'Реестр ККТ', stage: '21/21: Реестр ККТ', query: `"${inn}" регистрация ККТ телефон` }
        ];
        for (const s of stages) {
            try {
                console.log(`[Waterfall] ${s.label}: ${inn}...`);
                await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'running', stage: s.stage });
                const { emails, phones } = await this.ddg.searchWithTargetVisit(page, s.query, 5);
                this.email.filterBlocked(emails).forEach(e => contacts.emails.push({ val: e, source: s.label, type: 'official' }));
                phones.forEach(p => contacts.phones.push({ val: p, source: s.label, type: 'official' }));
                addSource(s.label, emails.length > 0 || phones.length > 0);
            }
            catch (e) {
                console.error(`[Waterfall] ${s.label} error:`, e);
                addSource(s.label, false, 'error');
            }
        }
    }
    /**
     * Строит финальный результат с приоритизацией контактов
     */
    buildFinalResult(contacts) {
        return {
            name: contacts.name,
            director: contacts.directorName,
            emails: this.prioritizer.prioritizeEmails(contacts.emails),
            phones: this.prioritizer.prioritizePhones(contacts.phones),
            sourcesChecked: contacts.sourcesChecked,
            url: contacts.websites[0] || '',
            updated_at: new Date().toISOString()
        };
    }
    /**
     * Сохраняет результат в Redis
     */
    async saveResult(inn, batchId, result) {
        await shared_1.redisClient.hset(`contacts:status:${inn}`, {
            status: 'completed',
            data: JSON.stringify(result)
        });
        if (batchId) {
            await shared_1.redisClient.hset(`batch:${batchId}:inn_status`, inn, 'completed');
            await shared_1.redisClient.expire(`batch:${batchId}:inn_status`, constants_1.BATCH_TTL_SEC);
        }
        const errorsCount = result.sourcesChecked.filter(s => s.status === 'error').length;
        if (result.emails.length === 0 && result.phones.length === 0) {
            console.log(`[Waterfall] Done ${inn}. Found 0 contacts. Stages with errors: ${errorsCount}`);
        }
        else {
            console.log(`[Waterfall] Done ${inn}. Found ${result.emails.length} emails, ${result.phones.length} phones. Stages with errors: ${errorsCount}`);
        }
    }
    /**
     * Обрабатывает ошибку обогащения
     */
    async handleError(inn, batchId, err) {
        console.error(`[Waterfall] Error ${inn}:`, err);
        await shared_1.redisClient.hset(`contacts:status:${inn}`, {
            status: 'error',
            error: err.message
        });
        if (batchId) {
            await shared_1.redisClient.hset(`batch:${batchId}:inn_status`, inn, 'error');
            await shared_1.redisClient.expire(`batch:${batchId}:inn_status`, constants_1.BATCH_TTL_SEC);
        }
    }
}
exports.EnrichmentService = EnrichmentService;
