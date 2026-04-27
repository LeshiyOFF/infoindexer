/**
 * EGRUL Person Row для записи в ClickHouse
 *
 * @remarks
 * Содержит временные метки для поддержки инкрементальных обновлений.
 * first_seen и last_changed извлекаются из FTM сущности.
 */
export interface EgrulPersonRow {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  father_name: string;
  /** Время первого появления в источнике (из FTM first_seen) */
  first_seen?: Date;
  /** Время последнего изменения (из FTM last_change) */
  last_changed?: Date;
}
