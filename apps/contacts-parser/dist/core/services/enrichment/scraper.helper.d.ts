/**
 * Helper для scraping стадий
 *
 * @remarks
 * Выносит логику парсинга Checko, DDG и официального сайта.
 */
import type { Page } from 'playwright';
import type { ContactInfo, SourceStatus } from '../../types/contacts.types';
import type { EmailService } from '../email.service';
import type { PhoneService } from '../phone.service';
/**
 * Helper для выполнения scraping стадий
 *
 * @remarks
 * Содержит логику парсинга различных источников.
 */
export declare class ScraperHelper {
    private readonly email;
    private readonly phone;
    constructor(email: EmailService, phone: PhoneService);
    /**
     * Парсит сайт Checko
     *
     * @param inn - ИНН организации
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    scrapeChecko(inn: string, page: Page, contacts: ContactInfo, addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): Promise<void>;
    /**
     * Ищет компанию в DuckDuckGo
     *
     * @param inn - ИНН организации
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    searchCompanyOnDDG(inn: string, page: Page, contacts: ContactInfo, addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): Promise<void>;
    /**
     * Парсит официальный сайт компании
     *
     * @param page - Экземпляр Page
     * @param contacts - Контейнер для контактов
     * @param addSource - Колбэк для добавления источника
     */
    scrapeOfficialSite(page: Page, contacts: ContactInfo, addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): Promise<void>;
}
