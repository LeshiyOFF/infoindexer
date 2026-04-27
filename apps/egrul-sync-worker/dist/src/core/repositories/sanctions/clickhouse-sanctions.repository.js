"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseSanctionsRepository = void 0;
const aggregation_helper_1 = require("./mappers/aggregation-helper");
const sanction_value_mapper_1 = require("./mappers/sanction-value-mapper");
const sanctions_mappers_1 = require("./mappers/sanctions-mappers");
const type_guards_util_1 = require("../../utils/type-guards.util");
/**
 * Adapter для работы с санкциями в ClickHouse
 *
 * @remarks
 * Реализует Port ISanctionStorage для ClickHouse.
 * Также реализует ISanctionRepository для обратной совместимости.
 */
class ClickHouseSanctionsRepository {
    client;
    aggregation;
    constructor(client) {
        this.client = client;
        this.aggregation = new aggregation_helper_1.AggregationHelper(client);
    }
    /**
     * Создаёт таблицу company_sanctions если не существует
     */
    async ensureTable() {
        await this.client.command({
            query: `
        CREATE TABLE IF NOT EXISTS company_sanctions (
          id String,
          inn String,
          program String,
          program_id String,
          authority String,
          country String,
          start_date Date,
          end_date Nullable(Date),
          source_url String,
          created_at DateTime DEFAULT now(),
          updated_at DateTime DEFAULT now(),
          INDEX inn_idx inn TYPE bloom_filter GRANULARITY 1,
          INDEX program_idx program TYPE bloom_filter GRANULARITY 1,
          INDEX country_idx country TYPE set(20) GRANULARITY 1,
          INDEX authority_idx authority TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
        ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY (inn, id)
        TTL max(updated_at) + INTERVAL 5 YEAR
        DELETE ON TTL expired
        SETTINGS index_granularity = 8192
      `
        });
    }
    /**
     * Сохраняет батч санкций
     */
    async saveBatch(rows) {
        if (rows.length === 0) {
            return;
        }
        await this.client.insert({
            table: 'company_sanctions',
            values: (0, sanction_value_mapper_1.prepareInsertBatch)(rows),
            format: 'JSONEachRow'
        });
    }
    async findByInn(inn) {
        const result = await this.client.query({
            query: `
        SELECT
          id,
          inn,
          program,
          program_id as programId,
          authority,
          country,
          toString(start_date) as startDate,
          toString(end_date) as endDate,
          source_url as sourceUrl,
          if(end_date IS NULL OR end_date > today(), 1, 0) as isActive
        FROM company_sanctions
        WHERE inn = {inn: String}
        ORDER BY start_date DESC
      `,
            query_params: { inn }
        });
        const json = await result.json();
        const rows = type_guards_util_1.TypeGuardUtil.ensureArray(json);
        return rows.map(sanctions_mappers_1.mapToSanctionDTO);
    }
    async findByInns(inns) {
        if (inns.length === 0) {
            return {};
        }
        const limitedInns = inns.slice(0, 1000);
        const result = await this.client.query({
            query: `
        SELECT
          inn,
          id,
          program,
          program_id as programId,
          authority,
          country,
          toString(start_date) as startDate,
          toString(end_date) as endDate,
          source_url as sourceUrl,
          if(end_date IS NULL OR end_date > today(), 1, 0) as isActive
        FROM company_sanctions
        WHERE inn IN ({inns: Array(String)})
        ORDER BY inn, start_date DESC
      `,
            query_params: { inns: limitedInns }
        });
        const json = await result.json();
        const rows = type_guards_util_1.TypeGuardUtil.ensureArray(json);
        return (0, sanctions_mappers_1.groupByInn)(rows);
    }
    async deleteByInn(inn) {
        await this.client.command({
            query: `ALTER TABLE company_sanctions DELETE WHERE inn = {inn: String}`,
            query_params: { inn }
        });
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
    async getStats() {
        const statsResult = await this.client.query({
            query: `
        SELECT
          count() as total,
          countIf(end_date IS NULL OR end_date > today()) as active
        FROM company_sanctions
      `
        });
        const statsJson = await statsResult.json();
        const statsRows = type_guards_util_1.TypeGuardUtil.ensureArray(statsJson);
        const data = statsRows[0];
        const [byCountry, byProgram] = await Promise.all([
            this.aggregation.getByCountry(),
            this.aggregation.getByProgram()
        ]);
        return {
            total: data.total,
            active: data.active,
            byCountry,
            byProgram
        };
    }
    async exists(inn) {
        const result = await this.client.query({
            query: `SELECT count() as cnt FROM company_sanctions WHERE inn = {inn: String} AND (end_date IS NULL OR end_date > today())`,
            query_params: { inn }
        });
        const json = await result.json();
        const rows = type_guards_util_1.TypeGuardUtil.ensureArray(json);
        return rows[0]?.cnt > 0;
    }
    async getAllInns(limit = 10000) {
        const result = await this.client.query({
            query: `SELECT DISTINCT inn FROM company_sanctions WHERE end_date IS NULL OR end_date > today() LIMIT {limit: UInt32}`,
            query_params: { limit }
        });
        const json = await result.json();
        const rows = type_guards_util_1.TypeGuardUtil.ensureArray(json);
        return rows.map(r => r.inn);
    }
}
exports.ClickHouseSanctionsRepository = ClickHouseSanctionsRepository;
