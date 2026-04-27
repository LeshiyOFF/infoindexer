import { SanctionTopicInfo } from './sanction-topic-info.model';
/**
 * Реестр маппинга topics → метаданные
 *
 * Вынесен в отдельный файл для соответствия правилу <200 строк
 * Содержит только данные без бизнес-логики
 *
 * @implements Single Responsibility Principle
 */
export declare class SanctionTopicsRegistry {
    private static readonly entries;
    /**
     * Возвращает Map для быстрого поиска topic → info
     */
    static getMap(): ReadonlyMap<string, SanctionTopicInfo>;
    /**
     * Возвращает все entries
     */
    static getAll(): readonly SanctionTopicInfo[];
    /**
     * Возвращает количество известных topics
     */
    static getCount(): number;
}
