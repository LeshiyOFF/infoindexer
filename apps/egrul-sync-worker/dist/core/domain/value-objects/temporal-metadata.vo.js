"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalMetadata = void 0;
class TemporalMetadata {
    firstSeenAt;
    lastChangedAt;
    sourceTimestamp;
    constructor(firstSeenAt, lastChangedAt, sourceTimestamp) {
        this.firstSeenAt = firstSeenAt;
        this.lastChangedAt = lastChangedAt;
        this.sourceTimestamp = sourceTimestamp;
    }
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
    static fromFTM(entity) {
        const firstSeen = entity.first_seen
            ? new Date(entity.first_seen)
            : new Date();
        const lastChanged = entity.last_change
            ? new Date(entity.last_change)
            : firstSeen;
        const sourceTimestamp = new Date();
        return new TemporalMetadata(firstSeen, lastChanged, sourceTimestamp);
    }
    /**
     * Создаёт TemporalMetadata для неизвестного источника
     *
     * @remarks
     * Используется как fallback когда временные метки недоступны.
     * Все поля устанавливаются в текущее время.
     *
     * @returns TemporalMetadata с текущими временными метками
     */
    static unknown() {
        const now = new Date();
        return new TemporalMetadata(now, now, now);
    }
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
    isNewerThan(timestamp) {
        return this.firstSeenAt > timestamp;
    }
    /**
     * Преобразует в формат для ClickHouse
     *
     * @remarks
     * Возвращает объект с датами в ISO 8601 формате для вставки в ClickHouse.
     *
     * @returns Объект с полями first_seen и last_changed
     */
    toClickHouseFormat() {
        return {
            first_seen: this.firstSeenAt.toISOString(),
            last_changed: this.lastChangedAt.toISOString()
        };
    }
    /**
     * Проверяет наличие валидных временных меток
     *
     * @remarks
     * Валидными считаются метки, отличные от epoch (1970-01-01).
     *
     * @returns true если метки валидны
     */
    isValid() {
        const epoch = new Date(0);
        return this.firstSeenAt > epoch && this.lastChangedAt > epoch;
    }
}
exports.TemporalMetadata = TemporalMetadata;
