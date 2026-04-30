"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionsFactory = void 0;
const clickhouse_sanctions_repository_1 = require("./clickhouse-sanctions.repository");
const aggregation_helper_1 = require("./mappers/aggregation-helper");
/**
 * Factory для создания компонентов работы с санкциями
 *
 * @remarks
 * Реализует Dependency Inversion Principle (DIP) из SOLID.
 * Клиентский код зависит от Port интерфейсов, а не от конкретных реализаций.
 *
 * @example
 * ```ts
 * const factory = new SanctionsFactory(clickHouseClient);
 * const storage = factory.createStorage();
 * const sanctions = await storage.findByInn('1234567890');
 * ```
 */
class SanctionsFactory {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Создаёт адаптер для хранения санкций
     *
     * @returns Реализация Port ISanctionStorage
     */
    createStorage() {
        return new clickhouse_sanctions_repository_1.ClickHouseSanctionsRepository(this.client);
    }
    /**
     * Создаёт адаптер для агрегации по санкциям
     *
     * @returns Реализация Port ISanctionAggregation
     */
    createAggregation() {
        return new aggregation_helper_1.AggregationHelper(this.client);
    }
}
exports.SanctionsFactory = SanctionsFactory;
