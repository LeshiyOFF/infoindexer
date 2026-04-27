/**
 * Factory для создания сервисов
 *
 * @remarks
 * Реализует Dependency Inversion Principle из SOLID.
 * Централизует создание всех сервисов и их зависимостей.
 */
import type { IEnrichmentService, IQueueService } from '../ports';
import { BrowserService } from './browser.service';
import { EmailService } from './email.service';
import { PhoneService } from './phone.service';
import { DuckDuckGoService } from './duckduckgo.service';
import { ContactPrioritizer } from './contact-prioritizer.service';
/**
 * Factory для создания сервисов обогащения
 *
 * @remarks
 * Управляет зависимостями и жизненным циклом сервисов.
 */
export declare class ServicesFactory {
    private browser;
    private email;
    private phone;
    private ddg;
    private prioritizer;
    private enrichment;
    private queue;
    /**
     * Создаёт или возвращает существующий сервис браузера
     */
    createBrowser(): BrowserService;
    /**
     * Создаёт или возвращает существующий сервис email
     */
    createEmail(): EmailService;
    /**
     * Создаёт или возвращает существующий сервис телефона
     */
    createPhone(): PhoneService;
    /**
     * Создаёт или возвращает существующий сервис DDG
     */
    createDuckDuckGo(): DuckDuckGoService;
    /**
     * Создаёт или возвращает существующий приоритизатор
     */
    createPrioritizer(): ContactPrioritizer;
    /**
     * Создаёт или возвращает существующий сервис обогащения
     */
    createEnrichment(): IEnrichmentService;
    /**
     * Создаёт или возвращает существующий сервис очереди
     */
    createQueue(): IQueueService;
    /**
     * Закрывает все ресурсы
     */
    shutdown(): Promise<void>;
}
