"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonLookupRepository = void 0;
/**
 * Репозиторий для поиска Person entities
 */
class PersonLookupRepository {
    clickhouse;
    constructor(clickhouse) {
        this.clickhouse = clickhouse;
    }
    /**
     * Получает все Person из raw таблицы для fuzzy matching
     */
    async fetchAllPersons() {
        const result = await this.clickhouse.query({
            query: `SELECT id, name FROM egrul_persons_raw WHERE length(name) > 3`,
            format: 'JSONEachRow'
        });
        return (await result.json());
    }
}
exports.PersonLookupRepository = PersonLookupRepository;
