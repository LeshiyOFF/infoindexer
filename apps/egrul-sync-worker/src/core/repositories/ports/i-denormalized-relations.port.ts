/**
 * Port для работы с денормализованными связями EGRUL
 *
 * @remarks
 * Доменный интерфейс для управления pre-aggregated данными о директорах и владельцах.
 * Denormalization shift computational work from query time to insert/pre-processing time.
 *
 * Следует Dependency Inversion Principle: зависит от абстракции (Port),
 * а не от конкретной реализации деталей.
 */

export interface IDenormalizedRelationsRepository {
  /**
   * Подготавливает денормализованные данные о директорах
   *
   * @remarks
   * - Вычисляет company_inn один раз через replaceAll()
   * - JOIN с egrul_persons_raw для получения имён
   * - Вставляет в egrul_directors_denormalized
   */
  prepareDirectors(): Promise<void>;

  /**
   * Подготавливает денормализованные данные о владельцах
   *
   * @remarks
   * - Вычисляет company_inn один раз через replaceAll()
   * - JOIN с egrul_persons_raw для получения имён
   * - Вставляет в egrul_founders_denormalized
   */
  prepareFounders(): Promise<void>;

  /**
   * Очищает денормализованные таблицы
   *
   * @remarks
   * Обеспечивает идемпотентность операций prepare*.
   * Использует TRUNCATE для сохранения схемы.
   */
  clear(): Promise<void>;
}
