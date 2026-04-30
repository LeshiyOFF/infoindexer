"use strict";
/**
 * ClickHouse Sanctions Query Service
 *
 * Выделенные query-методы для соблюдения лимита размера файла.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionsQueryService = void 0;
/**
 * Сервис для выполнения запросов к ClickHouse
 */
class SanctionsQueryService {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Загружает агрегированную статистику
     */
    async fetchStatsRow() {
        const resultSet = await this.client.query({
            query: `
        SELECT
          count() AS total,
          countIf(end_date IS NULL OR end_date > today()) AS active
        FROM company_sanctions
      `,
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return rows[0];
    }
    /**
     * Загружает группировку по странам
     */
    async fetchGroupByCountry() {
        const resultSet = await this.client.query({
            query: `
        SELECT country, count() AS cnt
        FROM company_sanctions
        GROUP BY country
        ORDER BY cnt DESC
      `,
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        const result = {};
        for (const { country, cnt } of rows) {
            result[country] = parseInt(cnt, 10);
        }
        return result;
    }
    /**
     * Загружает группировку по программам
     */
    async fetchGroupByProgram() {
        const resultSet = await this.client.query({
            query: `
        SELECT program, count() AS cnt
        FROM company_sanctions
        GROUP BY program
        ORDER BY cnt DESC
      `,
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        const result = {};
        for (const { program, cnt } of rows) {
            result[program] = parseInt(cnt, 10);
        }
        return result;
    }
    /**
     * Загружает полную статистику
     */
    async fetchFullStats() {
        const [statsRow, byCountry, byProgram] = await Promise.all([
            this.fetchStatsRow(),
            this.fetchGroupByCountry(),
            this.fetchGroupByProgram()
        ]);
        return {
            total: parseInt(statsRow.total, 10),
            active: parseInt(statsRow.active, 10),
            byCountry,
            byProgram
        };
    }
}
exports.SanctionsQueryService = SanctionsQueryService;
