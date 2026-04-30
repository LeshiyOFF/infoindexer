"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseAdapterFactory = void 0;
const adapters_1 = require("./adapters");
const organization_search_service_1 = require("./organization-search.service");
/**
 * Factory для создания адаптеров ClickHouse
 *
 * @remarks
 * Централизует создание зависимостей.
 * Упрощает тестирование через подмену зависимостей.
 */
class ClickHouseAdapterFactory {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Создаёт checker для summary таблицы
     */
    createSummaryChecker() {
        return new adapters_1.ClickHouseSummaryChecker(this.client);
    }
    /**
     * Создаёт executor для запросов
     */
    createQueryExecutor() {
        return new adapters_1.ClickHouseQueryExecutor(this.client);
    }
    /**
     * Создаёт сервис поиска связей
     */
    createConnections() {
        return new adapters_1.ClickHouseConnections(this.client);
    }
    /**
     * Создаёт порт для поиска организаций
     */
    createOrganizationSearch() {
        return new organization_search_service_1.OrganizationSearchService(this.createSummaryChecker(), this.createQueryExecutor());
    }
    /**
     * Создаёт порт для получения организации по ID
     */
    createOrganizationById() {
        return new adapters_1.ClickHouseOrganizationById(this.client, this.createConnections());
    }
}
exports.ClickHouseAdapterFactory = ClickHouseAdapterFactory;
