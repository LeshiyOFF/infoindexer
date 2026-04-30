/**
 * Результат поиска по ИНН от DaData
 */
export interface DaDataInnLookupResult {
    inn: string;
    fio: string | null;
    type: 'PERSON' | 'COMPANY' | null;
    raw: unknown;
}
/**
 * Адаптер для DaData API
 */
export declare class DaDataAdapter {
    private readonly apiKey;
    private readonly timeout;
    private readonly baseUrl;
    constructor(apiKey: string, timeout?: number);
    /**
     * Ищет информацию по ИНН физического лица
     */
    lookupPersonByInn(inn: string): Promise<DaDataInnLookupResult | null>;
    /**
     * Пакетный поиск по нескольким ИНН
     */
    lookupMultipleInns(inns: string[], batchSize?: number): Promise<Map<string, DaDataInnLookupResult>>;
    /**
     * Выполняет HTTP запрос к DaData API
     */
    private fetchInnData;
    /**
     * Парсит ответ от DaData
     */
    private parseInnData;
    /**
     * Извлекает ФИО из данных DaData
     */
    private extractFio;
    /**
     * Проверяет валидность ИНН
     */
    private isValidInn;
    /**
     * Обрабатывает ошибки HTTP запроса
     */
    private handleRequestError;
    private sleep;
}
