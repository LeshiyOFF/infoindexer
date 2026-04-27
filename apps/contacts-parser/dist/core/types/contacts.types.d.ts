/**
 * Типы для контактной информации
 *
 * @remarks
 * Определяет структуру данных для контактов.
 * Используется во всех сервисах обогащения.
 */
/** Тип контакта - указывает на источник и надёжность */
export type ContactType = 'direct' | 'official' | 'general' | 'verified';
/** Элемент контакта (email или телефон) */
export interface ContactItem {
    /** Значение контакта */
    readonly val: string;
    /** Источник получения */
    readonly source: string;
    /** Тип контакта */
    readonly type?: ContactType;
}
/** Статус источника данных */
export interface SourceStatus {
    /** Название источника */
    readonly name: string;
    /** Найдены ли данные */
    readonly found: boolean;
    /** Статус обработки */
    readonly status: 'completed' | 'error' | 'skipped';
}
/** Полная информация о контактах организации */
export interface ContactInfo {
    /** Найденные email */
    emails: ContactItem[];
    /** Найденные телефоны */
    phones: ContactItem[];
    /** Найденные веб-сайты */
    websites: string[];
    /** Название организации */
    name?: string;
    /** ФИО руководителя */
    directorName?: string;
    /** Адрес */
    address?: string;
    /** Статусы проверенных источников */
    sourcesChecked: SourceStatus[];
}
/** Результат обогащения контактов */
export interface EnrichmentResult {
    /** Название организации */
    readonly name?: string;
    /** ФИО руководителя */
    readonly director?: string;
    /** Email контакты */
    readonly emails: ContactItem[];
    /** Телефонные контакты */
    readonly phones: ContactItem[];
    /** Проверенные источники */
    readonly sourcesChecked: SourceStatus[];
    /** URL официального сайта */
    readonly url: string;
    /** Время обновления */
    readonly updated_at: string;
}
/** Задача в очереди обработки */
export interface QueuedTask {
    /** ИНН организации */
    readonly inn: string;
    /** ID батча (опционально) */
    readonly batchId?: string;
}
/** Результат поиска с контактами */
export interface SearchContactsResult {
    /** Найденные email */
    readonly emails: string[];
    /** Найденные телефоны */
    readonly phones: string[];
}
