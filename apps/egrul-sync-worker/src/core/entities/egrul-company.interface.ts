/**
 * EGRUL Company Row для записи в ClickHouse
 *
 * @remarks
 * Содержит временные метки для поддержки инкрементальных обновлений.
 * first_seen и last_changed извлекаются из FTM сущности.
 */
export interface EgrulCompanyRow {
  id: string;
  inn: string;
  name: string;
  status: string;
  address: string;
  /** Время первого появления в источнике (из FTM first_seen) */
  first_seen?: Date;
  /** Время последнего изменения (из FTM last_change) */
  last_changed?: Date;
}
