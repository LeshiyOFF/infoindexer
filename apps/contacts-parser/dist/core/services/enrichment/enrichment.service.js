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
const constants_1 = require("../../constants");
const scraper_helper_1 = require("./scraper.helper");
const stages_helper_1 = require("./stages.helper");
/**
 * Сервис для обогащения контактной информации
 *
 * @remarks
 * Выполняет многоэтапный OSINT поиск контактов организации.
 */
class EnrichmentService {
    browser;
    email;
    phone;
    prioritizer;
    scraper;
    stages;
    constructor(browser, ddg, email, phone, prioritizer) {
        this.browser = browser;
        this.email = email;
        this.phone = phone;
        this.prioritizer = prioritizer;
        this.scraper = new scraper_helper_1.ScraperHelper(email, phone);
        this.stages = new stages_helper_1.EnrichmentStagesHelper(ddg, email, phone);
    }
    /**
     * Получает обогащённую контактную информацию по ИНН
     */
    async getEnrichedData(inn, batchId) {
        let context = null;
        const contacts = { emails: [], phones: [], websites: [], sourcesChecked: [] };
        const addSource = (name, found, status = 'completed') => {
            contacts.sourcesChecked.push({ name, found, status });
        };
        try {
            context = await this.browser.createContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
            console.log(`[Waterfall] Enrichment INN: ${inn}`);
            await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'running' });
            await this.fetchFromClickHouse(inn, contacts, addSource);
            const page = await context.newPage();
            page.setDefaultTimeout(constants_1.PAGE_TIMEOUT_MS);
            await this.scraper.scrapeChecko(inn, page, contacts, addSource);
            await this.scraper.searchCompanyOnDDG(inn, page, contacts, addSource);
            await this.scraper.scrapeOfficialSite(page, contacts, addSource);
            if (contacts.directorName) {
                await this.stages.osintDirector(inn, page, contacts, contacts.directorName, contacts.name || '', addSource);
            }
            else {
                this.skipDirectorStages(addSource);
            }
            await this.stages.searchRegistries(inn, page, contacts, addSource);
            const result = this.buildFinalResult(contacts);
            await this.saveResult(inn, batchId, result);
            return result;
        }
        catch (err) {
            await this.handleError(inn, batchId, err);
            throw err;
        }
        finally {
            if (context)
                await context.close();
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
            const rows = (await chResult.json());
            if (rows && rows.length > 0) {
                if (rows[0].director)
                    contacts.directorName = rows[0].director;
                if (rows[0].name)
                    contacts.name = rows[0].name;
            }
            addSource('Внутренняя БД', !!(contacts.directorName || contacts.name));
        }
        catch (e) {
            console.error('[Waterfall] ClickHouse error:', e);
            addSource('Внутренняя БД', false, 'error');
        }
    }
    /** Пропускает стадии по директору (если не найден) */
    skipDirectorStages(addSource) {
        this.stages.getDirectorStagesLabels().forEach(l => addSource(l, false, 'skipped'));
    }
    /** Строит финальный результат с приоритизацией контактов */
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
    /** Сохраняет результат в Redis */
    async saveResult(inn, batchId, result) {
        await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'completed', data: JSON.stringify(result) });
        if (batchId) {
            await shared_1.redisClient.hset(`batch:${batchId}:inn_status`, inn, 'completed');
            await shared_1.redisClient.expire(`batch:${batchId}:inn_status`, constants_1.BATCH_TTL_SEC);
        }
        const errorsCount = result.sourcesChecked.filter(s => s.status === 'error').length;
        const msg = result.emails.length === 0 && result.phones.length === 0
            ? `Found 0 contacts. Stages with errors: ${errorsCount}`
            : `Found ${result.emails.length} emails, ${result.phones.length} phones. Stages with errors: ${errorsCount}`;
        console.log(`[Waterfall] Done ${inn}. ${msg}`);
    }
    /** Обрабатывает ошибку обогащения */
    async handleError(inn, batchId, err) {
        console.error(`[Waterfall] Error ${inn}:`, err);
        await shared_1.redisClient.hset(`contacts:status:${inn}`, { status: 'error', error: err.message });
        if (batchId) {
            await shared_1.redisClient.hset(`batch:${batchId}:inn_status`, inn, 'error');
            await shared_1.redisClient.expire(`batch:${batchId}:inn_status`, constants_1.BATCH_TTL_SEC);
        }
    }
}
exports.EnrichmentService = EnrichmentService;
