"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationHelper = void 0;
const sanctions_mappers_1 = require("./sanctions-mappers");
const type_guards_util_1 = require("../../../utils/type-guards.util");
/**
 * Adapter для агрегированных запросов по санкциям в ClickHouse
 *
 * @remarks
 * Реализует Port ISanctionAggregation для ClickHouse.
 */
class AggregationHelper {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Получает агрегацию по указанному полю
     *
     * @param field - Имя поля ('country' или 'program')
     * @returns Record с подсчётом
     */
    async getByField(field) {
        const result = await this.client.query({
            query: `
        SELECT ${field}, count() as cnt
        FROM company_sanctions
        GROUP BY ${field}
        ORDER BY cnt DESC
      `
        });
        const json = await result.json();
        const rows = type_guards_util_1.TypeGuardUtil.ensureArray(json);
        return (0, sanctions_mappers_1.buildCountMap)(rows, field);
    }
    /**
     * Получает агрегацию по странам
     */
    async getByCountry() {
        return this.getByField('country');
    }
    /**
     * Получает агрегацию по программам
     */
    async getByProgram() {
        return this.getByField('program');
    }
}
exports.AggregationHelper = AggregationHelper;
