/**
 * Сервис для приоритизации контактов
 *
 * @remarks
 * Реализует Port IContactPrioritizer для дедупликации и сортировки.
 * Удаляет дубликаты и объединяет источники для одинаковых контактов.
 */
import type { ContactItem } from '../types/contacts.types';
import type { IContactPrioritizer } from '../ports/i-enrichment.port';
import type { EmailService } from './email.service';
import type { PhoneService } from './phone.service';
/**
 * Сервис для приоритизации контактов
 *
 * @remarks
 * Объединяет дубликаты и сортирует по типу (direct > verified > official > general).
 */
export declare class ContactPrioritizer implements IContactPrioritizer {
    private readonly email;
    private readonly phone;
    constructor(email: EmailService, phone: PhoneService);
    /**
     * Удаляет дубликаты и сортирует контакты по приоритету
     *
     * @param items - Массив контактов
     * @returns Массив уникальных контактов с объединёнными источниками
     */
    prioritize(items: ReadonlyArray<ContactItem>): ContactItem[];
    /**
     * Фильтрует и приоритизирует email контакты
     *
     * @param items - Массив email контактов
     * @returns Отфильтрованный и приоритизированный массив
     */
    prioritizeEmails(items: ReadonlyArray<ContactItem>): ContactItem[];
    /**
     * Фильтрует и приоритизирует телефонные контакты
     *
     * @param items - Массив телефонных контактов
     * @returns Отфильтрованный и приоритизированный массив
     */
    prioritizePhones(items: ReadonlyArray<ContactItem>): ContactItem[];
}
