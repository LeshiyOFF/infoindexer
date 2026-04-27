/**
 * Adapter для обогащения контактной информации
 *
 * @remarks
 * Реализует Port IEnrichmentService для OSINT обогащения.
 * Координирует работу всех сервисов для сбора контактных данных.
 */
import type { EnrichmentResult } from '../types/contacts.types';
import type { IBrowserService } from '../ports/i-browser.port';
import type { IEnrichmentService } from '../ports/i-enrichment.port';
import type { IDuckDuckGoService } from '../ports/i-duckduckgo.port';
import type { EmailService } from './email.service';
import type { PhoneService } from './phone.service';
import type { ContactPrioritizer } from './contact-prioritizer.service';
/**
 * Сервис для обогащения контактной информации
 *
 * @remarks
 * Выполняет многоэтапный OSINT поиск контактов организации.
 */
export declare class EnrichmentService implements IEnrichmentService {
    private readonly browser;
    private readonly ddg;
    private readonly email;
    private readonly phone;
    private readonly prioritizer;
    constructor(browser: IBrowserService, ddg: IDuckDuckGoService, email: EmailService, phone: PhoneService, prioritizer: ContactPrioritizer);
    /**
     * Получает обогащённую контактную информацию по ИНН
     *
     * @param inn - ИНН организации
     * @param batchId - Опциональный ID батча
     * @returns Обогащённая контактная информация
     */
    getEnrichedData(inn: string, batchId?: string): Promise<EnrichmentResult>;
    /**
     * Получает данные из ClickHouse
     */
    private fetchFromClickHouse;
    /**
     * Парсит сайт Checko
     */
    private scrapeChecko;
    /**
     * Ищет компанию в DuckDuckGo
     */
    private searchCompanyOnDDG;
    /**
     * Парсит официальный сайт компании
     */
    private scrapeOfficialSite;
    /**
     * Выполняет OSINT поиск по директору
     */
    private osintDirector;
    /**
     * Пропускает стадии по директору (если не найден)
     */
    private skipDirectorStages;
    /**
     * Ищет в реестрах по ИНН
     */
    private searchRegistries;
    /**
     * Строит финальный результат с приоритизацией контактов
     */
    private buildFinalResult;
    /**
     * Сохраняет результат в Redis
     */
    private saveResult;
    /**
     * Обрабатывает ошибку обогащения
     */
    private handleError;
}
