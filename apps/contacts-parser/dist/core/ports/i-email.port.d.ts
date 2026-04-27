/**
 * Port для работы с email
 *
 * @remarks
 * Определяет контракт для валидации и парсинга email.
 * Реализует Dependency Inversion Principle из SOLID.
 */
/**
 * Port для работы с email
 *
 * @remarks
 * Определяет методы для проверки и извлечения email.
 */
export interface IEmailService {
    /**
     * Проверяет, является ли email заблокированным
     *
     * @param email - Email адрес
     * @returns true если email заблокирован
     */
    isBlocked(email: string): boolean;
    /**
     * Извлекает email адреса из текста
     *
     * @param text - Текст для поиска
     * @returns Массив найденных email
     */
    extract(text: string): string[];
    /**
     * Фильтрует массив email, убирая заблокированные
     *
     * @param emails - Массив email для фильтрации
     * @returns Отфильтрованный массив
     */
    filterBlocked(emails: readonly string[]): string[];
}
