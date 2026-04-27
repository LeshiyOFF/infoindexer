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

export class TemporalMetadata {
  private constructor(
    public readonly firstSeenAt: Date,
    public readonly lastChangedAt: Date,
    public readonly sourceTimestamp: Date
  ) {}

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
  static fromFTM(entity: FTMEntity): TemporalMetadata {
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
  static unknown(): TemporalMetadata {
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
  isNewerThan(timestamp: Date): boolean {
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
  toClickHouseFormat(): ClickHouseTemporalFormat {
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
  isValid(): boolean {
    const epoch = new Date(0);
    return this.firstSeenAt > epoch && this.lastChangedAt > epoch;
  }
}

/**
 * Формат временных меток для ClickHouse
 */
export interface ClickHouseTemporalFormat {
  first_seen: string;
  last_changed: string;
}
