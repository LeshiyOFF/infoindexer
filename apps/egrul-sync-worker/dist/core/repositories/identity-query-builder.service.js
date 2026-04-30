"use strict";
/**
 * Service for building SQL queries for identity mapping
 *
 * @remarks
 * Следует SRP: только построение SQL запросов.
 * Избегает дублирования через template-based подход.
 *
 * Query types:
 * - person_entity: mapping from egrul_persons_raw
 * - company_entity: mapping from egrul_companies_raw (by id)
 * - company_inn: mapping from egrul_companies_raw (by inn)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityQueryBuilderService = void 0;
class IdentityQueryBuilderService {
    static PERSON_ENTITY = 'person_entity';
    static COMPANY_ENTITY = 'company_entity';
    static COMPANY_INN = 'company_inn';
    buildPersonQuery(withFilter) {
        return this.buildInsertQuery({
            idType: IdentityQueryBuilderService.PERSON_ENTITY,
            sourceTable: 'egrul_persons_raw',
            rawIdColumn: 'id',
            canonicalIdColumn: 'id',
            entityType: 'person',
            source: 'direct_entity',
            withFilter
        });
    }
    buildCompanyEntityQuery(withFilter) {
        return this.buildInsertQuery({
            idType: IdentityQueryBuilderService.COMPANY_ENTITY,
            sourceTable: 'egrul_companies_raw',
            rawIdColumn: 'id',
            canonicalIdColumn: 'inn',
            entityType: 'company',
            source: 'direct_entity',
            withFilter
        });
    }
    buildCompanyInnQuery(withFilter) {
        return this.buildInsertQuery({
            idType: IdentityQueryBuilderService.COMPANY_INN,
            sourceTable: 'egrul_companies_raw',
            rawIdColumn: 'inn',
            canonicalIdColumn: 'inn',
            entityType: 'company',
            source: 'direct_inn',
            withFilter
        });
    }
    buildInsertQuery(params) {
        const whereClause = params.withFilter
            ? 'WHERE first_seen > {since:DateTime}'
            : '';
        return `
      INSERT INTO egrul_identity_mapping (
        id_type, raw_id, canonical_id, entity_type, source, confidence, created_at, updated_at
      )
      SELECT
        '${params.idType}' as id_type,
        ${params.rawIdColumn} as raw_id,
        ${params.canonicalIdColumn} as canonical_id,
        '${params.entityType}' as entity_type,
        '${params.source}' as source,
        1.0 as confidence,
        now() as created_at,
        now() as updated_at
      FROM ${params.sourceTable}
      ${whereClause}
      SETTINGS max_execution_time = 120, max_memory_usage = 6000000000
    `;
    }
}
exports.IdentityQueryBuilderService = IdentityQueryBuilderService;
