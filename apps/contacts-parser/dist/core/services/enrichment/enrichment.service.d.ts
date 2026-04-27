/**
 * Adapter для обогащения контактной информации
 *
 * @remarks
 * Реализует Port IEnrichmentService для OSINT обогащения.
 * Координирует работу всех сервисов для сбора контактных данных.
 */
import type { EnrichmentResult } from '../../types/contacts.types';
import type { IBrowserService } from '../../ports/i-browser.port';
import type { IEnrichmentService } from '../../ports/i-enrichment.port';
import type { IDuckDuckGoService } from '../../ports/i-duckduckgo.port';
import type { EmailService } from '../email.service';
import type { PhoneService } from '../phone.service';
import type { ContactPrioritizer } from '../contact-prioritizer.service';
/**
 * Сервис для обогащения контактной информации
 *
 * @remarks
 * Выполняет многоэтапный OSINT поиск контактов организации.
 */
export declare class EnrichmentService implements IEnrichmentService {
    private readonly browser;
    private readonly email;
    private readonly phone;
    private readonly prioritizer;
    private readonly scraper;
    private readonly stages;
    constructor(browser: IBrowserService, ddg: IDuckDuckGoService, email: EmailService, phone: PhoneService, prioritizer: ContactPrioritizer);
    /**
     * Получает обогащённую контактную информацию по ИНН
     */
    getEnrichedData(inn: string, batchId?: string): Promise<EnrichmentResult>;
    /**
     * Получает данные из ClickHouse
     */
    private fetchFromClickHouse;
    /** Пропускает стадии по директору (если не найден) */
    private skipDirectorStages;
    /** Строит финальный результат с приоритизацией контактов */
    private buildFinalResult;
    /** Сохраняет результат в Redis */
    private saveResult;
    /** Обрабатывает ошибку обогащения */
    private handleError;
}
