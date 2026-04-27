"use strict";
/**
 * Adapter для работы с телефонами
 *
 * @remarks
 * Реализует Port IPhoneService для нормализации телефонов.
 * Преобразует различные форматы к стандартному +7 (XXX) XXX-XX-XX.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneService = void 0;
/** Regex для поиска телефонов в тексте */
const PHONE_REGEX = /(?:\+7|8)[\s\-(]*\d{3}[\s\-)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/g;
/**
 * Сервис для работы с телефонами
 *
 * @remarks
 * Предоставляет методы для нормализации телефонных номеров.
 */
class PhoneService {
    /**
     * Нормализует телефонный номер к стандартному формату
     *
     * @param phone - Телефонный номер
     * @returns Нормализованный номер в формате +7 (XXX) XXX-XX-XX
     */
    normalize(phone) {
        let cleaned = phone.replace(/[^0-9]/g, '');
        // Замена 8 на +7
        if (cleaned.length === 11 && cleaned.startsWith('8')) {
            cleaned = '7' + cleaned.substring(1);
        }
        // Добавление кода страны для 10-значных номеров
        if (cleaned.length === 10) {
            cleaned = '7' + cleaned;
        }
        // Если длина не 11, возвращаем оригинал
        if (cleaned.length !== 11) {
            return phone;
        }
        return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
    }
    /**
     * Проверяет валидность длины телефона
     *
     * @param phone - Телефонный номер
     * @returns true если номер имеет достаточную длину (>=10 цифр)
     */
    isValidLength(phone) {
        const digits = phone.replace(/[^0-9]/g, '');
        return digits.length >= 10;
    }
    /**
     * Извлекает телефоны из текста
     *
     * @param text - Текст для поиска
     * @returns Массив найденных телефонов
     */
    extract(text) {
        const matches = text.match(PHONE_REGEX);
        if (!matches) {
            return [];
        }
        return matches.map(phone => this.normalize(phone));
    }
}
exports.PhoneService = PhoneService;
