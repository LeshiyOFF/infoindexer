import type { ClickHouseClient } from '@clickhouse/client';
import type { IMetaStorage } from './ports';
/**
 * Factory для создания компонентов работы с meta tables
 *
 * @remarks
 * Реализует Dependency Inversion Principle (DIP) из SOLID.
 */
export declare class MetaFactory {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Создаёт адаптер для хранения meta данных
     *
     * @returns Реализация Port IMetaStorage
     */
    createStorage(): IMetaStorage;
}
