/**
 * Sanction Repository Interface
 *
 * Port (в терминологии Hexagonal Architecture) для работы с санкциями.
 * Содержит только контракт — без реализации.
 *
 * @remarks
 * Repository работает с SanctionRow (внутренний формат) и SanctionDTO (API формат),
 * но НЕ с Domain Entities. Это следует Separation of Concerns.
 */
import type { SanctionDTO } from '../domain/entities';
/**
 * Внутренний формат строки в БД
 * Отделён от Domain Entity (Sanction) и DTO (SanctionDTO)
 */
export interface SanctionRow {
    readonly id: string;
    readonly inn: string;
    readonly program: string;
    readonly program_id: string;
    readonly authority: string;
    readonly country: string;
    readonly start_date: Date;
    readonly end_date: Date | null;
    readonly source_url: string;
    readonly created_at: Date;
    readonly updated_at: Date;
}
/**
 * Статистика по санкциям
 */
export interface SanctionStats {
    readonly total: number;
    readonly active: number;
    readonly byCountry: Readonly<Record<string, number>>;
    readonly byProgram: Readonly<Record<string, number>>;
}
/**
 * Port для работы с санкциями
 *
 * @example
 * ```ts
 * // Implementation (infrastructure layer):
 * class ClickHouseSanctionRepository implements ISanctionRepository {
 *   async findByInn(inn: string): Promise<readonly SanctionDTO[]> {
 *     // ClickHouse query...
 *   }
 * }
 * ```
 */
export interface ISanctionRepository {
    /**
     * Сохранить батч санкций
     *
     * @param rows - Внутренний формат БД, не Domain Entities
     * @throws RepositoryError при ошибке БД
     */
    saveBatch(rows: readonly SanctionRow[]): Promise<void>;
    /**
     * Найти санкции по ИНН
     *
     * @param inn - ИНН компании (валидированный)
     * @returns DTO для API responses
     * @throws InnNotFoundError если ИНН не найден
     */
    findByInn(inn: string): Promise<readonly SanctionDTO[]>;
    /**
     * Найти санкции по списку ИНН
     *
     * @param inns - Список ИНН (максимум 1000)
     * @returns Map от ИНН к списку санкций
     */
    findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>>;
    /**
     * Удалить все санкции для ИНН
     *
     * @param inn - ИНН компании
     */
    deleteByInn(inn: string): Promise<void>;
    /**
     * Получить статистику по санкциям
     *
     * @returns Агрегированная статистика
     */
    getStats(): Promise<SanctionStats>;
    /**
     * Проверить существование санкций для ИНН
     *
     * @param inn - ИНН компании
     * @returns true если есть хотя бы одна санкция
     */
    exists(inn: string): Promise<boolean>;
    /**
     * Получить все уникальные ИНН с санкциями
     *
     * @param limit - Максимум записей (default: 10000)
     * @returns Массив ИНН
     */
    getAllInns(limit?: number): Promise<readonly string[]>;
    /**
     * Удалить все санкции
     *
     * @remarks
     * Используется при abort для очистки частично загруженных данных.
     */
    deleteAll(): Promise<void>;
}
