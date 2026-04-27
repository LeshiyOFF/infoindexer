/**
 * Port для обогащения контактной информации
 *
 * @remarks
 * Определяет контракт для OSINT обогащения контактов.
 * Реализует Dependency Inversion Principle из SOLID.
 */
import type { EnrichmentResult, ContactItem } from '../types/contacts.types';
/**
 * Port для обогащения контактной информации
 *
 * @remarks
 * Определяет основной метод обогащения контактов организации.
 */
export interface IEnrichmentService {
    /**
     * Получает обогащённую контактную информацию по ИНН
     *
     * @param inn - ИНН организации
     * @param batchId - Опциональный ID батча
     * @returns Обогащённая контактная информация
     */
    getEnrichedData(inn: string, batchId?: string): Promise<EnrichmentResult>;
}
/**
 * Port для приоритизации контактов
 *
 * @remarks
 * Отдельный порт для дедупликации и сортировки контактов.
 */
export interface IContactPrioritizer {
    /**
     * Удаляет дубликаты и сортирует контакты по приоритету
     *
     * @param items - Массив контактов
     * @returns Массив уникальных контактов с объединёнными источниками
     */
    prioritize(items: ReadonlyArray<ContactItem>): ContactItem[];
}
