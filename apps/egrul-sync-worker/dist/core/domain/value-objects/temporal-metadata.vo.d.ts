/**
 * Value Object для временных метаданных сущности
 *
 * @remarks
 * Инкапсулирует временные характеристики сущности из FTM формата.
 * Следует Value Object pattern: immutable, равенство по значению.
 * Является Single Source of Truth для времени появления записи.
 *
 * @see https://www.opensanctions.org/docs/entities/
 */
import type { FTMEntity } from '../../entities/ftm-entity.interface';
export declare class TemporalMetadata {
    readonly firstSeenAt: Date;
    readonly lastChangedAt: Date;
    readonly sourceTimestamp: Date;
    private constructor();
    /**
     * Создаёт TemporalMetadata из FTM entity
     *
     * @remarks
     * Извлекает first_seen и last_change из корневых полей FTM сущности.
     * Если поля отсутствуют, использует текущее время как fallback.
     *
     * @param entity - FTM сущность
     * @returns TemporalMetadata с извлечёнными или текущими метками
     */
    static fromFTM(entity: FTMEntity): TemporalMetadata;
    /**
     * Создаёт TemporalMetadata для неизвестного источника
     *
     * @remarks
     * Используется как fallback когда временные метки недоступны.
     * Все поля устанавливаются в текущее время.
     *
     * @returns TemporalMetadata с текущими временными метками
     */
    static unknown(): TemporalMetadata;
    /**
     * Проверяет, является ли запись "новой" относительно timestamp
     *
     * @remarks
     * Используется для фильтрации записей при инкрементальных обновлениях.
     * Запись считается новой, если firstSeenAt > timestamp.
     *
     * @param timestamp - Временная метка для сравнения
     * @returns true если запись появилась после timestamp
     */
    isNewerThan(timestamp: Date): boolean;
    /**
     * Преобразует в формат для ClickHouse
     *
     * @remarks
     * Возвращает объект с датами в ISO 8601 формате для вставки в ClickHouse.
     *
     * @returns Объект с полями first_seen и last_changed
     */
    toClickHouseFormat(): ClickHouseTemporalFormat;
    /**
     * Проверяет наличие валидных временных меток
     *
     * @remarks
     * Валидными считаются метки, отличные от epoch (1970-01-01).
     *
     * @returns true если метки валидны
     */
    isValid(): boolean;
}
/**
 * Формат временных меток для ClickHouse
 */
export interface ClickHouseTemporalFormat {
    first_seen: string;
    last_changed: string;
}
