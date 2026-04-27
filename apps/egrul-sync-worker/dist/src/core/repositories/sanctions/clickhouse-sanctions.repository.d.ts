import type { ClickHouseClient } from '@clickhouse/client';
import type { ISanctionRepository, SanctionRow, SanctionStats } from 'shared/repositories/sanction.repository';
import type { SanctionDTO } from 'shared/domain/entities';
import type { ISanctionStorage } from './ports/i-sanction-storage.port';
/**
 * Adapter для работы с санкциями в ClickHouse
 *
 * @remarks
 * Реализует Port ISanctionStorage для ClickHouse.
 * Также реализует ISanctionRepository для обратной совместимости.
 */
export declare class ClickHouseSanctionsRepository implements ISanctionStorage, ISanctionRepository {
    private readonly client;
    private readonly aggregation;
    constructor(client: ClickHouseClient);
    /**
     * Создаёт таблицу company_sanctions если не существует
     */
    ensureTable(): Promise<void>;
    /**
     * Сохраняет батч санкций
     */
    saveBatch(rows: readonly SanctionRow[]): Promise<void>;
    findByInn(inn: string): Promise<readonly SanctionDTO[]>;
    findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>>;
    deleteByInn(inn: string): Promise<void>;
    /**
     * Удаляет все санкции
     *
     * @remarks
     * Используется при abort для очистки частично загруженных данных.
     * TRUNCATE более эффективен чем DELETE для полной очистки.
     */
    deleteAll(): Promise<void>;
    getStats(): Promise<SanctionStats>;
    exists(inn: string): Promise<boolean>;
    getAllInns(limit?: number): Promise<readonly string[]>;
}
