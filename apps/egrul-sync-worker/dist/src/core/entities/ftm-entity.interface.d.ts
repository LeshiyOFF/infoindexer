/**
 * FTM (FollowTheMoney) Entity интерфейс
 * Представляет сущность из OpenSanctions FTM формата
 *
 * @remarks
 * Содержит временные метки на корневом уровне для поддержки инкрементальных обновлений.
 * first_seen и last_change извлекаются из JSON дампа OpenSanctions.
 *
 * @see https://www.opensanctions.org/docs/api/
 * @see https://www.opensanctions.org/docs/entities/
 */
export interface FTMEntity {
    id: string;
    schema: string;
    /** Временная метка первого появления сущности (ISO 8601) */
    first_seen?: string;
    /** Временная метка последнего изменения сущности (ISO 8601) */
    last_change?: string;
    properties: FTMEntityProperties;
}
/**
 * Properties для FTM Entity
 * Все поля опциональны и представлены как массивы для множественных значений
 */
export interface FTMEntityProperties {
    innCode?: string[];
    name?: string[];
    status?: string[];
    address?: string[];
    director?: string[];
    organization?: string[];
    role?: string[];
    incorporationDate?: string[];
    startDate?: string[];
    endDate?: string[];
    owner?: string[];
    asset?: string[];
    percentage?: string[];
    sharesCount?: string[];
    firstName?: string[];
    lastName?: string[];
    fatherName?: string[];
    /**
     * Список topics из OpenSanctions
     * Например: ['sanction', 'role.pep', 'crime.corruption']
     *
     * @see https://www.opensanctions.org/topics/
     */
    topics?: string[];
}
