import type { ClickHouseClient } from '@clickhouse/client';
import type { ISanctionRepository, SanctionRow, SanctionStats } from 'shared/repositories/sanction.repository';
import type { SanctionDTO } from 'shared/domain/entities';
import type { ISanctionStorage } from './sanctions/ports';
import type { IMetaStorage, SupportedRow } from './meta/ports';
/**
 * Union type for all supported row types
 * Re-exported from port for convenience
 */
export type { SupportedRow };
/**
 * Facade для работы с ClickHouse
 *
 * @remarks
 * Объединяет все репозитории в единую точку входа.
 * Использует Factory для создания зависимостей (Dependency Inversion).
 *
 * Таблицы создаются через миграции при старте приложения (index.ts).
 *
 * @example
 * ```ts
 * const repo = new ClickHouseRepository(client);
 * await repo.insertBatch('egrul_companies_raw', companies);
 * const sanctions = await repo.sanctions.findByInn('1234567890');
 * ```
 */
export declare class ClickHouseRepository implements ISanctionRepository {
    private readonly client;
    readonly meta: IMetaStorage;
    readonly sanctions: ISanctionStorage;
    private readonly sanctionsFactory;
    constructor(client: ClickHouseClient);
    /**
     * Вставляет батч записей в таблицу
     *
     * @remarks
     * Supports both legacy and MV row types.
     */
    insertBatch(table: string, values: SupportedRow[]): Promise<void>;
    /**
     * Очищает временные raw таблицы
     */
    cleanupRawTables(): Promise<void>;
    /**
     * Удаляет частично загруженные данные при abort
     *
     * @remarks
     * Делегирует в meta storage для очистки raw таблиц и identity_mapping.
     */
    clearPartialData(): Promise<void>;
    saveBatch(rows: readonly SanctionRow[]): Promise<void>;
    findByInn(inn: string): Promise<readonly SanctionDTO[]>;
    findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>>;
    deleteByInn(inn: string): Promise<void>;
    getStats(): Promise<SanctionStats>;
    exists(inn: string): Promise<boolean>;
    getAllInns(limit?: number): Promise<readonly string[]>;
    /**
     * Удаляет все санкции
     *
     * @remarks
     * Делегирует в sanctions storage для очистки всех санкций.
     */
    deleteAll(): Promise<void>;
}
