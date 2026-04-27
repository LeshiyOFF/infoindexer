"use strict";
/**
 * Сервис для приоритизации контактов
 *
 * @remarks
 * Реализует Port IContactPrioritizer для дедупликации и сортировки.
 * Удаляет дубликаты и объединяет источники для одинаковых контактов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactPrioritizer = void 0;
/**
 * Сервис для приоритизации контактов
 *
 * @remarks
 * Объединяет дубликаты и сортирует по типу (direct > verified > official > general).
 */
class ContactPrioritizer {
    email;
    phone;
    constructor(email, phone) {
        this.email = email;
        this.phone = phone;
    }
    /**
     * Удаляет дубликаты и сортирует контакты по приоритету
     *
     * @param items - Массив контактов
     * @returns Массив уникальных контактов с объединёнными источниками
     */
    prioritize(items) {
        const typePriority = {
            direct: 0,
            verified: 1,
            official: 2,
            general: 3
        };
        const map = new Map();
        for (const item of items) {
            const existing = map.get(item.val);
            const currentPriority = typePriority[item.type || 'general'] ?? 9;
            const existingPriority = existing ? (typePriority[existing.type || 'general'] ?? 9) : 99;
            if (!existing || currentPriority < existingPriority) {
                map.set(item.val, {
                    ...item,
                    allSources: existing ? [...new Set([...existing.allSources, item.source])] : [item.source]
                });
            }
            else {
                // Если существующий лучше или такой же, добавляем источник
                const updated = existing;
                updated.allSources = [...new Set([...updated.allSources, item.source])];
            }
        }
        return Array.from(map.values()).map(item => ({
            val: item.val,
            source: item.allSources.join(', '),
            type: item.type
        }));
    }
    /**
     * Фильтрует и приоритизирует email контакты
     *
     * @param items - Массив email контактов
     * @returns Отфильтрованный и приоритизированный массив
     */
    prioritizeEmails(items) {
        const filtered = items.filter(item => !this.email.isBlocked(item.val));
        return this.prioritize(filtered);
    }
    /**
     * Фильтрует и приоритизирует телефонные контакты
     *
     * @param items - Массив телефонных контактов
     * @returns Отфильтрованный и приоритизированный массив
     */
    prioritizePhones(items) {
        const filtered = items.filter(item => this.phone.isValidLength(item.val));
        return this.prioritize(filtered);
    }
}
exports.ContactPrioritizer = ContactPrioritizer;
