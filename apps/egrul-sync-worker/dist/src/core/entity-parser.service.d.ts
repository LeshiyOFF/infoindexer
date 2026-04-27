/**
 * Entity Parser Service
 *
 * @remarks
 * Parses FTM entities into EGRUL staging row format.
 * Following Staging + Transform pattern with Hexagonal Architecture.
 *
 * Staging Pattern: Returns raw FTM entities for staging layer storage.
 * Transform layer handles ID → INN/Name resolution.
 */
import type { FTMEntity } from './entities';
import type { EgrulCompanyRow, StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from './domain/entities';
/**
 * Результат парсинга сущности
 *
 * @remarks
 * Union type for all possible parsed rows.
 * Uses staging entities for relationships (requires transformation).
 */
export type ParsedEntity = EgrulCompanyRow | StagingCompanyRow | StagingDirectorshipRow | StagingOwnershipRow;
/**
 * Сервис для парсинга FTM сущностей в EGRUL row format
 *
 * @remarks
 * Following SRP: responsible only for parsing logic.
 * Following DRY: unified temporal metadata extraction.
 *
 * Companies are parsed to production format (have INN directly).
 * Relationships are parsed to staging format (have FTM IDs, need transformation).
 */
export declare class EntityParserService {
    /**
     * Парсит FTM сущность и возвращает соответствующий row или null
     *
     * @param entity - FTM сущность
     * @returns ParsedEntity или null
     */
    parseEntity(entity: FTMEntity): ParsedEntity | null;
    /**
     * Парсит Company сущность в production format
     *
     * @remarks
     * Companies go directly to production (have INN).
     * No staging transformation needed.
     */
    private parseCompany;
    /**
     * Парсит Person сущность в staging format
     *
     * @remarks
     * Person entities are stored in staging for potential enrichment.
     * Primary identifier is FTM entity ID.
     */
    private parseStagingCompany;
    /**
     * Парсит Directorship сущность в staging format
     *
     * @remarks
     * Returns staging format with FTM entity IDs.
     * Transform layer resolves organization_id → INN, director_id → name.
     */
    private parseDirectorship;
    /**
     * Парсит Ownership сущность в staging format
     *
     * @remarks
     * Returns staging format with FTM entity IDs.
     * Transform layer resolves asset_id → INN, owner_id → name.
     */
    private parseOwnership;
    /**
     * Извлекает временные метки из FTM сущности
     *
     * @remarks
     * DRY compliance: единый метод для извлечения временных меток.
     */
    private extractTemporalMetadata;
    /**
     * Проверяет является ли row Company (production format)
     */
    isCompanyRow(row: unknown): row is EgrulCompanyRow;
    /**
     * Проверяет является ли row StagingCompany
     */
    isStagingCompanyRow(row: unknown): row is StagingCompanyRow;
    /**
     * Проверяет является ли row StagingDirectorship
     */
    isStagingDirectorshipRow(row: unknown): row is StagingDirectorshipRow;
    /**
     * Проверяет является ли row StagingOwnership
     */
    isStagingOwnershipRow(row: unknown): row is StagingOwnershipRow;
}
