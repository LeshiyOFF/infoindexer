"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaFactory = void 0;
const clickhouse_meta_repository_1 = require("./clickhouse-meta.repository");
/**
 * Factory для создания компонентов работы с meta tables
 *
 * @remarks
 * Реализует Dependency Inversion Principle (DIP) из SOLID.
 */
class MetaFactory {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Создаёт адаптер для хранения meta данных
     *
     * @returns Реализация Port IMetaStorage
     */
    createStorage() {
        return new clickhouse_meta_repository_1.ClickHouseMetaRepository(this.client);
    }
}
exports.MetaFactory = MetaFactory;
