/**
 * Adapter для работы с телефонами
 *
 * @remarks
 * Реализует Port IPhoneService для нормализации телефонов.
 * Преобразует различные форматы к стандартному +7 (XXX) XXX-XX-XX.
 */
import type { IPhoneService } from '../ports/i-phone.port';
/**
 * Сервис для работы с телефонами
 *
 * @remarks
 * Предоставляет методы для нормализации телефонных номеров.
 */
export declare class PhoneService implements IPhoneService {
    /**
     * Нормализует телефонный номер к стандартному формату
     *
     * @param phone - Телефонный номер
     * @returns Нормализованный номер в формате +7 (XXX) XXX-XX-XX
     */
    normalize(phone: string): string;
    /**
     * Проверяет валидность длины телефона
     *
     * @param phone - Телефонный номер
     * @returns true если номер имеет достаточную длину (>=10 цифр)
     */
    isValidLength(phone: string): boolean;
    /**
     * Извлекает телефоны из текста
     *
     * @param text - Текст для поиска
     * @returns Массив найденных телефонов
     */
    extract(text: string): string[];
}
