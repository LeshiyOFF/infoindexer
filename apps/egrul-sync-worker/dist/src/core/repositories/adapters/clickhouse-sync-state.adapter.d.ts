/**
 * ClickHouse адаптер для хранения состояния синхронизации
 *
 * @remarks
 * Реализует Port ISyncStateStoragePort для ClickHouse.
 * Хранит состояние в таблице egrul_sync_state.
 * Следует SRP: отвечает только за хранение состояния синхронизации.
 * Следует DIP: реализует абстракцию из Domain Layer.
 * Следует ISP: содержит только необходимые методы.
 *
 * @see ISyncStateStoragePort
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { ISyncStateStoragePort } from '../../ports/i-sync-state-storage.port';
export declare class ClickHouseSyncStateAdapter implements ISyncStateStoragePort {
    private readonly client;
    /**
     * Создаёт адаптер для работы с состоянием синхронизации
     *
     * @param client - ClickHouse клиент
     */
    constructor(client: ClickHouseClient);
    /**
     * Получает временную метку последней успешной синхронизации
     *
     * @remarks
     * Запрашивает последнюю запись для данного sync_type.
     * Если записей нет, возвращает null.
     *
     * @param syncType - Тип синхронизации
     * @returns Timestamp последней синхронизации или null
     */
    getLastSyncTimestamp(syncType: string): Promise<Date | null>;
    /**
     * Сохраняет временную метку синхронизации
     *
     * @remarks
     * Вставляет новую запись в таблицу состояния.
     * ReplacingMergeTree автоматически удаляет старые записи с тем же sync_type.
     *
     * @param syncType - Тип синхронизации
     * @param timestamp - Временная метка синхронизации
     */
    saveSyncTimestamp(syncType: string, timestamp: Date): Promise<void>;
    /**
     * Сохраняет результаты синхронизации с метриками
     *
     * @remarks
     * Расширенная версия saveSyncTimestamp с дополнительными метриками.
     *
     * @param syncType - Тип синхронизации
     * @param timestamp - Временная метка синхронизации
     * @param recordsProcessed - Количество обработанных записей
     * @param durationMs - Длительность синхронизации
     */
    saveSyncResult(syncType: string, timestamp: Date, recordsProcessed: number, durationMs: number): Promise<void>;
    /**
     * Получает количество обработанных записей из последней синхронизации
     *
     * @remarks
     * Запрашивает последнюю запись для данного sync_type.
     * Если записей нет, возвращает 0.
     *
     * @param syncType - Тип синхронизации
     * @returns Количество обработанных записей
     */
    getRecordsProcessed(syncType: string): Promise<number>;
}
