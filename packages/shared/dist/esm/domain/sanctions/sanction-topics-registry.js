import { sanctionsEntries } from './registry/sanctions-entries';
import { politicalEntries } from './registry/political-entries';
import { crimeEntries } from './registry/crime-entries';
import { financingEntries } from './registry/financing-entries';
import { specialEntries } from './registry/special-entries';
/**
 * Реестр маппинга topics → метаданные
 *
 * Вынесен в отдельный файл для соответствия правилу <200 строк
 * Содержит только данные без бизнес-логики
 *
 * @implements Single Responsibility Principle
 */
export class SanctionTopicsRegistry {
    static entries = Object.freeze([
        ...sanctionsEntries,
        ...politicalEntries,
        ...crimeEntries,
        ...financingEntries,
        ...specialEntries,
    ]);
    /**
     * Возвращает Map для быстрого поиска topic → info
     */
    static getMap() {
        const map = new Map();
        for (const entry of SanctionTopicsRegistry.entries) {
            map.set(entry.topic, entry);
        }
        return map;
    }
    /**
     * Возвращает все entries
     */
    static getAll() {
        return SanctionTopicsRegistry.entries;
    }
    /**
     * Возвращает количество известных topics
     */
    static getCount() {
        return SanctionTopicsRegistry.entries.length;
    }
}
