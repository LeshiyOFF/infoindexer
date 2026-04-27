"use strict";
/**
 * Factory для создания сервисов
 *
 * @remarks
 * Реализует Dependency Inversion Principle из SOLID.
 * Централизует создание всех сервисов и их зависимостей.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesFactory = void 0;
const browser_service_1 = require("./browser.service");
const email_service_1 = require("./email.service");
const phone_service_1 = require("./phone.service");
const duckduckgo_service_1 = require("./duckduckgo.service");
const enrichment_service_1 = require("./enrichment/enrichment.service");
const contact_prioritizer_service_1 = require("./contact-prioritizer.service");
const queue_service_1 = require("./queue.service");
/**
 * Factory для создания сервисов обогащения
 *
 * @remarks
 * Управляет зависимостями и жизненным циклом сервисов.
 */
class ServicesFactory {
    browser = null;
    email = null;
    phone = null;
    ddg = null;
    prioritizer = null;
    enrichment = null;
    queue = null;
    /**
     * Создаёт или возвращает существующий сервис браузера
     */
    createBrowser() {
        if (!this.browser) {
            this.browser = new browser_service_1.BrowserService();
        }
        return this.browser;
    }
    /**
     * Создаёт или возвращает существующий сервис email
     */
    createEmail() {
        if (!this.email) {
            this.email = new email_service_1.EmailService();
        }
        return this.email;
    }
    /**
     * Создаёт или возвращает существующий сервис телефона
     */
    createPhone() {
        if (!this.phone) {
            this.phone = new phone_service_1.PhoneService();
        }
        return this.phone;
    }
    /**
     * Создаёт или возвращает существующий сервис DDG
     */
    createDuckDuckGo() {
        if (!this.ddg) {
            const email = this.createEmail();
            const phone = this.createPhone();
            this.ddg = new duckduckgo_service_1.DuckDuckGoService(email, phone);
        }
        return this.ddg;
    }
    /**
     * Создаёт или возвращает существующий приоритизатор
     */
    createPrioritizer() {
        if (!this.prioritizer) {
            const email = this.createEmail();
            const phone = this.createPhone();
            this.prioritizer = new contact_prioritizer_service_1.ContactPrioritizer(email, phone);
        }
        return this.prioritizer;
    }
    /**
     * Создаёт или возвращает существующий сервис обогащения
     */
    createEnrichment() {
        if (!this.enrichment) {
            const browser = this.createBrowser();
            const ddg = this.createDuckDuckGo();
            const email = this.createEmail();
            const phone = this.createPhone();
            const prioritizer = this.createPrioritizer();
            this.enrichment = new enrichment_service_1.EnrichmentService(browser, ddg, email, phone, prioritizer);
        }
        return this.enrichment;
    }
    /**
     * Создаёт или возвращает существующий сервис очереди
     */
    createQueue() {
        if (!this.queue) {
            const enrichment = this.createEnrichment();
            this.queue = new queue_service_1.QueueService(enrichment);
        }
        return this.queue;
    }
    /**
     * Закрывает все ресурсы
     */
    async shutdown() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
exports.ServicesFactory = ServicesFactory;
