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
  /** Время первого появления в источнике (из FTM first_seen). Формат: YYYY-MM-DD HH:mm:ss.SSS */
  first_seen?: string;
  /** Время последнего изменения (из FTM last_change). Формат: YYYY-MM-DD HH:mm:ss.SSS */
  last_changed?: string;
}
