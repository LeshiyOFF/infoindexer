import { SanctionLevel } from './sanction-level.enum';
/**
 * Информация о санкционном topic
 * Содержит метаданные для отображения и классификации
 */
export interface SanctionTopicInfo {
    /**
     * Идентификатор topic (значение из OpenSanctions)
     */
    readonly topic: string;
    /**
     * Отображаемое название на русском
     */
    readonly label: string;
    /**
     * Уровень риска
     */
    readonly level: SanctionLevel;
    /**
     * Описание для пользователей
     */
    readonly description?: string;
    /**
     * Категория для группировки
     */
    readonly category: SanctionCategory;
}
/**
 * Категория санкционной метки для группировки в UI
 */
export declare enum SanctionCategory {
    /** Международные санкции */
    SANCTIONS = "sanctions",
    /** Политические связи */
    POLITICAL = "political",
    /** Криминал */
    CRIME = "crime",
    /** Финансирование */
    FINANCING = "financing",
    /** Специальные метки */
    SPECIAL = "special"
}
/**
 * Сводная информация о санкциях компании
 * Результат классификации списка topics
 */
export interface CompanySanctions {
    /**
     * Исходный список topics из OpenSanctions
     */
    readonly topics: readonly string[];
    /**
     * Общий уровень риска (максимальный из всех topics)
     */
    readonly level: SanctionLevel;
    /**
     * Наличие любых санкционных меток
     */
    readonly hasSanctions: boolean;
    /**
     * Детализированная информация по каждому известному topic
     * Неизвестные topics не включаются
     */
    readonly details: readonly SanctionTopicInfo[];
    /**
     * Topics, которые не распознались системой
     */
    readonly unknownTopics: readonly string[];
}
/**
 * Параметры для создания SanctionTopicInfo
 */
export interface SanctionTopicInfoParams {
    readonly topic: string;
    readonly label: string;
    readonly level: SanctionLevel;
    readonly description?: string;
    readonly category: SanctionCategory;
}
/**
 * Factory для создания SanctionTopicInfo
 */
export declare function createSanctionTopicInfo(params: SanctionTopicInfoParams): SanctionTopicInfo;
