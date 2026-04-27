/**
 * Helper для стадий OSINT обогащения
 *
 * @remarks
 * Выносит сложную логику стадий из EnrichmentService.
 * Разбивает God function на управляемые части.
 */
import type { Page } from 'playwright';
import type { ContactInfo, SourceStatus } from '../../types/contacts.types';
import type { IDuckDuckGoService } from '../../ports/i-duckduckgo.port';
import type { EmailService } from '../email.service';
import type { PhoneService } from '../phone.service';
/**
 * Helper для выполнения OSINT стадий
 *
 * @remarks
 * Содержит логику поиска по директору и реестрам.
 */
export declare class EnrichmentStagesHelper {
    private readonly ddg;
    private readonly email;
    private readonly phone;
    constructor(ddg: IDuckDuckGoService, email: EmailService, phone: PhoneService);
    /**
     * Выполняет OSINT поиск по директору
     *
     * @param inn - ИНН организации
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param directorName - ФИО директора
     * @param companyName - Название компании
     * @param addSource - Колбэк для добавления источника
     */
    osintDirector(inn: string, page: Page, contacts: ContactInfo, directorName: string, companyName: string, addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): Promise<void>;
    /**
     * Выполняет одну стадию поиска по директору
     */
    private runDirectorStage;
    /**
     * Ищет в реестрах по ИНН
     *
     * @param inn - ИНН организации
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    searchRegistries(inn: string, page: Page, contacts: ContactInfo, addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): Promise<void>;
    /**
     * Выполняет одну стадию поиска в реестрах
     */
    private runRegistryStage;
    /**
     * Возвращает список стадий директора для пропуска
     */
    getDirectorStagesLabels(): string[];
}
