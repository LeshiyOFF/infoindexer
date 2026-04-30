"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionTopicsRegistry = void 0;
const sanctions_entries_1 = require("./registry/sanctions-entries");
const political_entries_1 = require("./registry/political-entries");
const crime_entries_1 = require("./registry/crime-entries");
const financing_entries_1 = require("./registry/financing-entries");
const special_entries_1 = require("./registry/special-entries");
/**
 * Реестр маппинга topics → метаданные
 *
 * Вынесен в отдельный файл для соответствия правилу <200 строк
 * Содержит только данные без бизнес-логики
 *
 * @implements Single Responsibility Principle
 */
class SanctionTopicsRegistry {
    static entries = Object.freeze([
        ...sanctions_entries_1.sanctionsEntries,
        ...political_entries_1.politicalEntries,
        ...crime_entries_1.crimeEntries,
        ...financing_entries_1.financingEntries,
        ...special_entries_1.specialEntries,
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
exports.SanctionTopicsRegistry = SanctionTopicsRegistry;
