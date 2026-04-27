"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseIdentityResolverAdapter = void 0;
class ClickHouseIdentityResolverAdapter {
    client;
    static COMPANY_QUERY = `
    SELECT canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'company_entity' AND raw_id = {id:String}
    LIMIT 1
  `;
    static PERSON_QUERY = `
    SELECT canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'person_entity' AND raw_id = {id:String}
    LIMIT 1
  `;
    static COMPANY_BATCH_QUERY = `
    SELECT raw_id, canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'company_entity' AND raw_id IN ({ids:Array(String)})
  `;
    static PERSON_BATCH_QUERY = `
    SELECT raw_id, canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'person_entity' AND raw_id IN ({ids:Array(String)})
  `;
    constructor(client) {
        this.client = client;
    }
    async resolveCompanyToInn(companyId) {
        const resultSet = await this.client.query({
            query: ClickHouseIdentityResolverAdapter.COMPANY_QUERY,
            query_params: { id: companyId },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return rows.length > 0 ? rows[0].canonical_id : null;
    }
    async resolvePersonToName(personId) {
        const resultSet = await this.client.query({
            query: ClickHouseIdentityResolverAdapter.PERSON_QUERY,
            query_params: { id: personId },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return rows.length > 0 ? rows[0].canonical_id : null;
    }
    async resolveBatch(companyIds, personIds) {
        const [companyResult, personResult] = await Promise.all([
            this.resolveCompaniesBatch(companyIds),
            this.resolvePersonsBatch(personIds)
        ]);
        return {
            companyToInn: new Map(Object.entries(companyResult)),
            personToName: new Map(Object.entries(personResult))
        };
    }
    async resolveCompaniesBatch(ids) {
        if (ids.length === 0) {
            return {};
        }
        const resultSet = await this.client.query({
            query: ClickHouseIdentityResolverAdapter.COMPANY_BATCH_QUERY,
            query_params: { ids },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return Object.fromEntries(rows.map((r) => [r.raw_id, r.canonical_id]));
    }
    async resolvePersonsBatch(ids) {
        if (ids.length === 0) {
            return {};
        }
        const resultSet = await this.client.query({
            query: ClickHouseIdentityResolverAdapter.PERSON_BATCH_QUERY,
            query_params: { ids },
            format: 'JSONEachRow'
        });
        const rows = await resultSet.json();
        return Object.fromEntries(rows.map((r) => [r.raw_id, r.canonical_id]));
    }
}
exports.ClickHouseIdentityResolverAdapter = ClickHouseIdentityResolverAdapter;
