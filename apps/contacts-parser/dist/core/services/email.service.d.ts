/**
 * Adapter для работы с email
 *
 * @remarks
 * Реализует Port IEmailService для валидации и парсинга email.
 * Использует regex и списки заблокированных доменов.
 */
import type { IEmailService } from '../ports/i-email.port';
/**
 * Сервис для работы с email
 *
 * @remarks
 * Предоставляет методы для проверки, извлечения и фильтрации email.
 */
export declare class EmailService implements IEmailService {
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
