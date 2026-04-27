import { ClickHouseConnections, ClickHouseOrganizationById, ClickHouseQueryExecutor, ClickHouseSummaryChecker } from './adapters';
import { OrganizationSearchService } from './organization-search.service';
/**
 * Factory для создания адаптеров ClickHouse
 *
 * @remarks
 * Централизует создание зависимостей.
 * Упрощает тестирование через подмену зависимостей.
 */
export class ClickHouseAdapterFactory {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Создаёт checker для summary таблицы
     */
    createSummaryChecker() {
        return new ClickHouseSummaryChecker(this.client);
    }
    /**
     * Создаёт executor для запросов
     */
    createQueryExecutor() {
        return new ClickHouseQueryExecutor(this.client);
    }
    /**
     * Создаёт сервис поиска связей
     */
    createConnections() {
        return new ClickHouseConnections(this.client);
    }
    /**
     * Создаёт порт для поиска организаций
     */
    createOrganizationSearch() {
        return new OrganizationSearchService(this.createSummaryChecker(), this.createQueryExecutor());
    }
    /**
     * Создаёт порт для получения организации по ID
     */
    createOrganizationById() {
        return new ClickHouseOrganizationById(this.client, this.createConnections());
    }
}
