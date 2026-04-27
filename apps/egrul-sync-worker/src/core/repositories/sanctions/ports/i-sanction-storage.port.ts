import type { SanctionDTO } from 'shared/domain/entities';
import type { SanctionRow, SanctionStats } from 'shared/repositories/sanction.repository';

/**
 * Port для работы с хранилищем санкций
 *
 * @remarks
 * Доменный интерфейс для операций с санкциями.
 * Отделяет бизнес-логику от инфраструктуры хранения (ClickHouse).
 */
export interface ISanctionStorage {
  /**
   * Сохраняет батч санкций
   *
   * @param rows — Массив записей санкций
   */
  saveBatch(rows: readonly SanctionRow[]): Promise<void>;

  /**
   * Находит санкции по ИНН
   *
   * @param inn — ИНН организации
   * @returns Массив DTO санкций
   */
  findByInn(inn: string): Promise<readonly SanctionDTO[]>;

  /**
   * Находит санкции по списку ИНН
   *
   * @param inns — Массив ИНН
   * @returns Record с группировкой по ИНН
   */
  findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>>;

  /**
   * Удаляет все санкции для ИНН
   *
   * @param inn — ИНН организации
   */
  deleteByInn(inn: string): Promise<void>;

  /**
   * Получает статистику по санкциям
   *
   * @returns Статистика: total, active, агрегации
   */
  getStats(): Promise<SanctionStats>;

  /**
   * Проверяет существование активных санкций для ИНН
   *
   * @param inn — ИНН организации
   * @returns true если есть активные санкции
   */
  exists(inn: string): Promise<boolean>;

  /**
   * Получает все уникальные ИНН с активными санкциями
   *
   * @param limit — Максимальное количество
   * @returns Массив ИНН
   */
  getAllInns(limit?: number): Promise<readonly string[]>;

  /**
   * Удаляет все санкции
   *
   * @remarks
   * Используется при abort для очистки частично загруженных данных.
   */
  deleteAll(): Promise<void>;
}
