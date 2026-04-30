"use strict";
/**
 * ClickHouse Sanctions Repository
 *
 * Реализация Port ISanctionRepository для ClickHouse.
 * Adapter в терминологии Hexagonal Architecture.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseSanctionsRepository = void 0;
const clickhouse_sanctions_mapper_1 = require("./clickhouse-sanctions.mapper");
const clickhouse_sanctions_queries_service_1 = require("./clickhouse-sanctions-queries.service");
/**
 * ClickHouse реализация репозитория санкций
 */
class ClickHouseSanctionsRepository {
    client;
    queries;
    constructor(client) {
        this.client = client;
        this.queries = new clickhouse_sanctions_queries_service_1.SanctionsQueryService(client);
    }
    /**
     * Сохраняет батч санкций
     */
    async saveBatch(rows) {
        if (rows.length === 0)
            return;
        await this.client.insert({
            table: 'company_sanctions',
            values: rows,
            format: 'JSONEachRow'
        });
    }
    /**
     * Находит санкции по ИНН
     */
    async findByInn(inn) {
        const resultSet = await this.client.query({
            query: `
        SELECT *
        FROM company_sanctions
        WHERE inn = {inn: String}
        ORDER BY start_date DESC
      `,
            query_params: { inn },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return clickhouse_sanctions_mapper_1.sanctionMapper.rowsToDTO(rows);
    }
    /**
     * Находит санкции по списку ИНН
     */
    async findByInns(inns) {
        if (inns.length === 0)
            return {};
        const resultSet = await this.client.query({
            query: `
        SELECT *
        FROM company_sanctions
        WHERE inn IN {inns: Array(String)}
        ORDER BY inn, start_date DESC
      `,
            query_params: { inns },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        // Группируем по ИНН
        const result = {};
        for (const row of rows) {
            if (!result[row.inn]) {
                result[row.inn] = [];
            }
            result[row.inn].push(clickhouse_sanctions_mapper_1.sanctionMapper.rowToDTO(row));
        }
        return result;
    }
    /**
     * Удаляет все санкции для ИНН
     */
    async deleteByInn(inn) {
        await this.client.command({
            query: `
        ALTER TABLE company_sanctions
        DELETE WHERE inn = {inn: String}
      `,
            query_params: { inn }
        });
    }
    /**
     * Получает статистику по санкциям
     */
    async getStats() {
        return this.queries.fetchFullStats();
    }
    /**
     * Проверяет существование санкций для ИНН
     */
    async exists(inn) {
        const resultSet = await this.client.query({
            query: `
        SELECT count() AS cnt
        FROM company_sanctions
        WHERE inn = {inn: String}
        LIMIT 1
      `,
            query_params: { inn },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return parseInt(rows[0].cnt, 10) > 0;
    }
    /**
     * Получает все уникальные ИНН с санкциями
     */
    async getAllInns(limit = 10000) {
        const resultSet = await this.client.query({
            query: `
        SELECT DISTINCT inn
        FROM company_sanctions
        ORDER BY inn
        LIMIT {limit: UInt32}
      `,
            query_params: { limit },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return rows.map(r => r.inn);
    }
    /**
     * Удаляет все санкции
     *
     * @remarks
     * Используется при abort для очистки частично загруженных данных.
     * TRUNCATE более эффективен чем DELETE для полной очистки.
     */
    async deleteAll() {
        await this.client.command({
            query: `TRUNCATE TABLE company_sanctions`
        });
    }
}
exports.ClickHouseSanctionsRepository = ClickHouseSanctionsRepository;
