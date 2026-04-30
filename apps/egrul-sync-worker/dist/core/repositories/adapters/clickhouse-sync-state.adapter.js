"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseSyncStateAdapter = void 0;
class ClickHouseSyncStateAdapter {
    client;
    /**
     * Создаёт адаптер для работы с состоянием синхронизации
     *
     * @param client - ClickHouse клиент
     */
    constructor(client) {
        this.client = client;
    }
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
    async getLastSyncTimestamp(syncType) {
        const result = await this.client.query({
            query: `
        SELECT last_sync_at
        FROM egrul_sync_state
        WHERE sync_type = {sync_type:String}
        ORDER BY updated_at DESC
        LIMIT 1
      `,
            query_params: { sync_type: syncType },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        if (rows.length === 0)
            return null;
        return new Date(rows[0].last_sync_at);
    }
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
    async saveSyncTimestamp(syncType, timestamp) {
        await this.client.insert({
            table: 'egrul_sync_state',
            values: [{
                    sync_type: syncType,
                    last_sync_at: timestamp,
                    records_processed: 0,
                    duration_ms: 0
                }],
            format: 'JSONEachRow'
        });
    }
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
    async saveSyncResult(syncType, timestamp, recordsProcessed, durationMs) {
        await this.client.insert({
            table: 'egrul_sync_state',
            values: [{
                    sync_type: syncType,
                    last_sync_at: timestamp,
                    records_processed: recordsProcessed,
                    duration_ms: durationMs
                }],
            format: 'JSONEachRow'
        });
    }
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
    async getRecordsProcessed(syncType) {
        const result = await this.client.query({
            query: `
        SELECT records_processed
        FROM egrul_sync_state
        WHERE sync_type = {sync_type:String}
        ORDER BY updated_at DESC
        LIMIT 1
      `,
            query_params: { sync_type: syncType },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        if (rows.length === 0)
            return 0;
        return rows[0].records_processed;
    }
}
exports.ClickHouseSyncStateAdapter = ClickHouseSyncStateAdapter;
