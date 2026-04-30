/**
 * Value Object для нормализации INN
 *
 * @remarks
 * Выделяет INН из OpenSanctions ID формата "ru-inn-{INN}".
 * Pure function - без side effects, без зависимостей от инфраструктуры.
 *
 * Следует SRP: единственная ответственность - нормализация ID.
 *
 * Алгоритм O(1): position() проверяет префикс, substring() извлекает значение.
 */
/**
 * Value Object для нормализации INN
 */
export declare class InnNormalizer {
    private static readonly RU_INN_PREFIX;
    private static readonly PREFIX_LENGTH;
    private static readonly INN_START_INDEX;
    /**
     * Нормализует ID в INN
     *
     * @param id - ID из OpenSanctions (формата "ru-inn-{INN}" или entity UUID)
     * @returns INН или пустую строку если ID не соответствует формату
     *
     * @remarks
     * Алгоритм:
     * 1. Проверяет что ID начинается с "ru-inn-"
     * 2. Извлекает подстроку начиная с 8-го символа
     * 3. Возвращает пустую строку для non-INN ID
     *
     * Сложность: O(1) - проверка префикса + извлечение подстроки
     */
    static normalizeInn(id: string): string;
    /**
     * Проверяет что ID соответствует формату INN
     *
     * @param id - ID для проверки
     * @returns true если ID начинается с "ru-inn-"
     */
    static isInnFormat(id: string): boolean;
}
