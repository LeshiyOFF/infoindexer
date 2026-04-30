"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanctionTopicsService = exports.SanctionTopicsService = void 0;
const sanction_topic_enum_1 = require("./sanction-topic.enum");
const sanction_level_enum_1 = require("./sanction-level.enum");
const sanction_topics_registry_1 = require("./sanction-topics-registry");
/**
 * Сервис для работы с санкционными topics
 *
 * Domain Layer: чистая бизнес-логика без зависимостей от инфраструктуры
 *
 * Responsibilities:
 * - Классификация списка topics
 * - Определение уровня риска
 * - Поиск информации по topic
 *
 * Данные о topics хранятся в SanctionTopicsRegistry
 *
 * @implements Single Responsibility Principle
 */
class SanctionTopicsService {
    topicInfo;
    constructor() {
        this.topicInfo = sanction_topics_registry_1.SanctionTopicsRegistry.getMap();
    }
    /**
     * Классифицирует список topics в структурированную информацию
     *
     * @param topics - массив строк topics из OpenSanctions
     * @returns структурированная информация о санкциях
     */
    classify(topics = []) {
        if (topics.length === 0) {
            return this.emptyResult();
        }
        const known = [];
        const unknown = [];
        for (const topic of topics) {
            const info = this.topicInfo.get(topic);
            if (info) {
                known.push(info);
            }
            else if (topic?.trim()) {
                unknown.push(topic);
            }
        }
        if (known.length === 0) {
            return this.emptyResult(unknown);
        }
        const level = this.calculateLevel(known);
        return {
            topics,
            level,
            hasSanctions: level !== sanction_level_enum_1.SanctionLevel.NONE,
            details: known,
            unknownTopics: unknown
        };
    }
    /**
     * Проверяет является ли topic санкционным
     */
    isSanctionTopic(topic) {
        return (0, sanction_topic_enum_1.isValidSanctionTopic)(topic);
    }
    /**
     * Получает информацию по topic
     */
    getInfo(topic) {
        return this.topicInfo.get(topic);
    }
    /**
     * Получает все topics указанной категории
     */
    getByCategory(category) {
        return Array.from(this.topicInfo.values()).filter(info => info.category === category);
    }
    /**
     * Проверяет является ли уровень высоким или средним
     */
    isSignificant(level) {
        return level === sanction_level_enum_1.SanctionLevel.HIGH || level === sanction_level_enum_1.SanctionLevel.MEDIUM;
    }
    /**
     * Возвращает общее количество известных topics
     */
    getKnownTopicsCount() {
        return this.topicInfo.size;
    }
    /**
     * Создаёт пустой результат
     */
    emptyResult(unknownTopics = []) {
        return {
            topics: [],
            level: sanction_level_enum_1.SanctionLevel.NONE,
            hasSanctions: false,
            details: [],
            unknownTopics
        };
    }
    /**
     * Вычисляет общий уровень риска на основе списка details
     * Возвращает максимальный уровень
     */
    calculateLevel(details) {
        if (details.length === 0) {
            return sanction_level_enum_1.SanctionLevel.NONE;
        }
        return details.reduce((acc, info) => (0, sanction_level_enum_1.maxSanctionLevel)(acc, info.level), sanction_level_enum_1.SanctionLevel.NONE);
    }
}
exports.SanctionTopicsService = SanctionTopicsService;
/**
 * Singleton экземпляр сервиса для использования во всём приложении
 * Соответствует принципу Dependency Inversion - зависимость от абстракции
 */
exports.sanctionTopicsService = new SanctionTopicsService();
