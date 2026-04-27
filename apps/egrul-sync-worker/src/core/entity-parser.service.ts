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
import type {
  EgrulCompanyRow,
  StagingCompanyRow,
  StagingDirectorshipRow,
  StagingOwnershipRow
} from './domain/entities';
import { parseDate, parseNullableDate } from './parsers/date.parser';

/**
 * Результат парсинга сущности
 *
 * @remarks
 * Union type for all possible parsed rows.
 * Uses staging entities for relationships (requires transformation).
 */
export type ParsedEntity =
  | EgrulCompanyRow
  | StagingCompanyRow
  | StagingDirectorshipRow
  | StagingOwnershipRow;

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
export class EntityParserService {
  /**
   * Парсит FTM сущность и возвращает соответствующий row или null
   *
   * @param entity - FTM сущность
   * @returns ParsedEntity или null
   */
  parseEntity(
    entity: FTMEntity
  ): ParsedEntity | null {
    switch (entity.schema) {
      case 'Company':
      case 'Organization':
      case 'LegalEntity':
        return this.parseCompany(entity);

      case 'Person':
        return this.parseStagingCompany(entity);

      case 'Directorship':
        return this.parseDirectorship(entity);

      case 'Ownership':
        return this.parseOwnership(entity);

      default:
        return null;
    }
  }

  /**
   * Парсит Company сущность в production format
   *
   * @remarks
   * Companies go directly to production (have INN).
   * No staging transformation needed.
   */
  private parseCompany(entity: FTMEntity): EgrulCompanyRow | null {
    const inn = entity.properties.innCode?.[0] || '';
    if (!inn) {
      return null;
    }

    return {
      id: entity.id,
      inn,
      name: entity.properties.name?.[0] || '',
      status: entity.properties.status?.[0] || 'ACTIVE',
      address: entity.properties.address?.[0] || '',
      ...this.extractTemporalMetadata(entity)
    };
  }

  /**
   * Парсит Person сущность в staging format
   *
   * @remarks
   * Person entities are stored in staging for potential enrichment.
   * Primary identifier is FTM entity ID.
   */
  private parseStagingCompany(entity: FTMEntity): StagingCompanyRow | null {
    const inn = entity.properties.innCode?.[0] || '';
    if (!inn) {
      return null;
    }

    return {
      id: entity.id,
      inn,
      name: entity.properties.name?.[0] || '',
      status: 'ACTIVE',
      address: entity.properties.address?.[0] || '',
      ...this.extractTemporalMetadata(entity)
    };
  }

  /**
   * Парсит Directorship сущность в staging format
   *
   * @remarks
   * Returns staging format with FTM entity IDs.
   * Transform layer resolves organization_id → INN, director_id → name.
   */
  private parseDirectorship(entity: FTMEntity): StagingDirectorshipRow | null {
    const orgId = entity.properties.organization?.[0] || '';
    const dirId = entity.properties.director?.[0] || '';

    if (!orgId || !dirId) {
      return null;
    }

    return {
      id: entity.id,
      organization_id: orgId,
      director_id: dirId,
      role: entity.properties.role?.[0] || 'Director',
      start_date: parseDate(entity.properties.startDate?.[0]),
      end_date: parseNullableDate(entity.properties.endDate?.[0])
    };
  }

  /**
   * Парсит Ownership сущность в staging format
   *
   * @remarks
   * Returns staging format with FTM entity IDs.
   * Transform layer resolves asset_id → INN, owner_id → name.
   */
  private parseOwnership(entity: FTMEntity): StagingOwnershipRow | null {
    const ownerId = entity.properties.owner?.[0] || '';
    const assetId = entity.properties.asset?.[0] || '';

    if (!ownerId || !assetId) {
      return null;
    }

    return {
      id: entity.id,
      owner_id: ownerId,
      asset_id: assetId,
      percentage: entity.properties.percentage?.[0] || '0',
      shares_count: entity.properties.sharesCount?.[0] || '0',
      start_date: parseDate(entity.properties.startDate?.[0]),
      end_date: parseNullableDate(entity.properties.endDate?.[0])
    };
  }

  /**
   * Извлекает временные метки из FTM сущности
   *
   * @remarks
   * DRY compliance: единый метод для извлечения временных меток.
   */
  private extractTemporalMetadata(entity: FTMEntity): {
    first_seen?: Date;
    last_changed?: Date;
  } {
    if (!entity.first_seen) {
      return {};
    }

    return {
      first_seen: new Date(entity.first_seen),
      last_changed: entity.last_change
        ? new Date(entity.last_change)
        : new Date(entity.first_seen)
    };
  }

  /**
   * Проверяет является ли row Company (production format)
   */
  isCompanyRow(row: unknown): row is EgrulCompanyRow {
    return (
      typeof row === 'object' &&
      row !== null &&
      'inn' in row &&
      'name' in row
    );
  }

  /**
   * Проверяет является ли row StagingCompany
   */
  isStagingCompanyRow(row: unknown): row is StagingCompanyRow {
    return (
      typeof row === 'object' &&
      row !== null &&
      'id' in row &&
      'inn' in row &&
      'first_seen' in row
    );
  }

  /**
   * Проверяет является ли row StagingDirectorship
   */
  isStagingDirectorshipRow(row: unknown): row is StagingDirectorshipRow {
    return (
      typeof row === 'object' &&
      row !== null &&
      'organization_id' in row &&
      'director_id' in row
    );
  }

  /**
   * Проверяет является ли row StagingOwnership
   */
  isStagingOwnershipRow(row: unknown): row is StagingOwnershipRow {
    return (
      typeof row === 'object' &&
      row !== null &&
      'owner_id' in row &&
      'asset_id' in row
    );
  }
}
