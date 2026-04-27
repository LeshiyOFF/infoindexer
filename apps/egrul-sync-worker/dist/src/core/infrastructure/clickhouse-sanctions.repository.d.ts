/**
 * ClickHouse Sanctions Repository
 *
 * Реализация Port ISanctionRepository для ClickHouse.
 * Adapter в терминологии Hexagonal Architecture.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { SanctionRow, SanctionStats } from 'shared/repositories';
import type { ISanctionRepository } from 'shared/repositories';
import type { SanctionDTO } from 'shared/domain/entities';
/**
 * ClickHouse реализация репозитория санкций
 */
export declare class ClickHouseSanctionsRepository implements ISanctionRepository {
    private readonly client;
    private readonly queries;
    constructor(client: ClickHouseClient);
    /**
     * Сохраняет батч санкций
     */
    saveBatch(rows: readonly SanctionRow[]): Promise<void>;
    /**
     * Находит санкции по ИНН
     */
    findByInn(inn: string): Promise<readonly SanctionDTO[]>;
    /**
     * Находит санкции по списку ИНН
     */
    findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>>;
    /**
     * Удаляет все санкции для ИНН
     */
    deleteByInn(inn: string): Promise<void>;
    /**
     * Получает статистику по санкциям
     */
    getStats(): Promise<SanctionStats>;
    /**
     * Проверяет существование санкций для ИНН
     */
    exists(inn: string): Promise<boolean>;
    /**
     * Получает все уникальные ИНН с санкциями
     */
    getAllInns(limit?: number): Promise<readonly string[]>;
    /**
     * Удаляет все санкции
     *
     * @remarks
     * Используется при abort для очистки частично загруженных данных.
     * TRUNCATE более эффективен чем DELETE для полной очистки.
     */
    deleteAll(): Promise<void>;
}
