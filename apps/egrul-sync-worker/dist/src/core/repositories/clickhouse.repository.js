"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseRepository = void 0;
const meta_factory_1 = require("./meta/meta.factory");
const sanctions_factory_1 = require("./sanctions/sanctions.factory");
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
class ClickHouseRepository {
    client;
    meta;
    sanctions;
    sanctionsFactory;
    constructor(client) {
        this.client = client;
        const metaFactory = new meta_factory_1.MetaFactory(client);
        this.meta = metaFactory.createStorage();
        this.sanctionsFactory = new sanctions_factory_1.SanctionsFactory(client);
        this.sanctions = this.sanctionsFactory.createStorage();
    }
    // ===============================
    // Meta methods (delegated)
    // ===============================
    /**
     * Вставляет батч записей в таблицу
     *
     * @remarks
     * Supports both legacy and MV row types.
     */
    async insertBatch(table, values) {
        await this.meta.insertBatch(table, values);
    }
    /**
     * Очищает временные raw таблицы
     */
    async cleanupRawTables() {
        await this.meta.cleanupRawTables();
    }
    /**
     * Удаляет частично загруженные данные при abort
     *
     * @remarks
     * Делегирует в meta storage для очистки raw таблиц и identity_mapping.
     */
    async clearPartialData() {
        await this.meta.clearPartialData();
    }
    // ===============================
    // ISanctionRepository Implementation (delegated)
    // ===============================
    async saveBatch(rows) {
        await this.sanctions.saveBatch(rows);
    }
    async findByInn(inn) {
        return await this.sanctions.findByInn(inn);
    }
    async findByInns(inns) {
        return await this.sanctions.findByInns(inns);
    }
    async deleteByInn(inn) {
        await this.sanctions.deleteByInn(inn);
    }
    async getStats() {
        return await this.sanctions.getStats();
    }
    async exists(inn) {
        return await this.sanctions.exists(inn);
    }
    async getAllInns(limit) {
        return await this.sanctions.getAllInns(limit);
    }
    /**
     * Удаляет все санкции
     *
     * @remarks
     * Делегирует в sanctions storage для очистки всех санкций.
     */
    async deleteAll() {
        await this.sanctions.deleteAll();
    }
}
exports.ClickHouseRepository = ClickHouseRepository;
