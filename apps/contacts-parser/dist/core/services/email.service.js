"use strict";
/**
 * Adapter для работы с email
 *
 * @remarks
 * Реализует Port IEmailService для валидации и парсинга email.
 * Использует regex и списки заблокированных доменов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const constants_1 = require("../constants");
/** Regex для поиска email в тексте */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
/**
 * Сервис для работы с email
 *
 * @remarks
 * Предоставляет методы для проверки, извлечения и фильтрации email.
 */
class EmailService {
    /**
     * Проверяет, является ли email заблокированным
     *
     * @param email - Email адрес
     * @returns true если email заблокирован
     */
    isBlocked(email) {
        const lower = email.toLowerCase();
        // Проверка по шаблонам
        if (constants_1.BLOCKED_EMAILS.some(block => lower.includes(block))) {
            return true;
        }
        // Проверка по доменам
        const domain = lower.split('@')[1];
        if (domain) {
            return constants_1.BLOCKED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
        }
        return false;
    }
    /**
     * Извлекает email адреса из текста
     *
     * @param text - Текст для поиска
     * @returns Массив найденных email
     */
    extract(text) {
        const matches = text.match(EMAIL_REGEX);
        return matches || [];
    }
    /**
     * Фильтрует массив email, убирая заблокированные
     *
     * @param emails - Массив email для фильтрации
     * @returns Отфильтрованный массив
     */
    filterBlocked(emails) {
        return emails.filter(email => !this.isBlocked(email));
    }
}
exports.EmailService = EmailService;
