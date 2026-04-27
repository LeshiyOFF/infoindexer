import { SanctionTopic } from './sanction-topic.enum';
import { SanctionLevel } from './sanction-level.enum';
import { SanctionTopicInfo, CompanySanctions, SanctionCategory } from './sanction-topic-info.model';
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
export declare class SanctionTopicsService {
    private readonly topicInfo;
    constructor();
    /**
     * Классифицирует список topics в структурированную информацию
     *
     * @param topics - массив строк topics из OpenSanctions
     * @returns структурированная информация о санкциях
     */
    classify(topics?: readonly string[]): CompanySanctions;
    /**
     * Проверяет является ли topic санкционным
     */
    isSanctionTopic(topic: string): topic is SanctionTopic;
    /**
     * Получает информацию по topic
     */
    getInfo(topic: string): SanctionTopicInfo | undefined;
    /**
     * Получает все topics указанной категории
     */
    getByCategory(category: SanctionCategory): readonly SanctionTopicInfo[];
    /**
     * Проверяет является ли уровень высоким или средним
     */
    isSignificant(level: SanctionLevel): boolean;
    /**
     * Возвращает общее количество известных topics
     */
    getKnownTopicsCount(): number;
    /**
     * Создаёт пустой результат
     */
    private emptyResult;
    /**
     * Вычисляет общий уровень риска на основе списка details
     * Возвращает максимальный уровень
     */
    private calculateLevel;
}
/**
 * Singleton экземпляр сервиса для использования во всём приложении
 * Соответствует принципу Dependency Inversion - зависимость от абстракции
 */
export declare const sanctionTopicsService: SanctionTopicsService;
