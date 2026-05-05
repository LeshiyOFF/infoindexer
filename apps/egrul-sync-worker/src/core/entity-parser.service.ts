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
  StagingDirectorshipRow,
  StagingEntityRow,
  StagingOwnershipRow
} from './domain/entities';
import type { FtmSchema } from './domain/entities/staging-entity.entity';
import { parseDate, parseNullableDate } from './parsers/date.parser';

/**
 * Результат парсинга сущности
 *
 * @remarks
 * Union type for all possible parsed rows.
 * Uses staging entities for relationships (requires transformation).
 */
export type ParsedEntity =
  | StagingEntityRow
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
      case 'Person':
        return this.parseBaseEntity(entity);

      case 'Directorship':
        return this.parseDirectorship(entity);

      case 'Ownership':
        return this.parseOwnership(entity);

      default:
        return null;
    }
  }

  /**
   * Парсит base entity в unified staging format
   *
   * @remarks
   * Unified parser for all FTM base entities (Company, Organization, LegalEntity, Person).
   * Returns StagingEntityRow without INN filter — all entities are preserved.
   */
  private parseBaseEntity(entity: FTMEntity): StagingEntityRow | null {
    if (!entity.id || !entity.first_seen) {
      return null;
    }

    const schema = this.normalizeSchema(entity.schema);
    if (!schema) {
      return null;
    }

    const temporal = this.extractTemporalMetadata(entity);
    if (!temporal.first_seen || !temporal.last_changed) {
      return null;
    }

    return {
      id: entity.id,
      schema,
      inn: entity.properties.innCode?.[0],
      name: entity.properties.name?.[0],
      status: entity.properties.status?.[0],
      address: entity.properties.address?.[0],
      first_seen: temporal.first_seen,
      last_changed: temporal.last_changed
    };
  }

  /**
   * Нормализует schema в FtmSchema
   *
   * @remarks
   * FTM schema discriminator validator for base entities.
   */
  private normalizeSchema(schema: string): FtmSchema | null {
    switch (schema) {
      case 'Company':
      case 'Organization':
      case 'LegalEntity':
      case 'Person':
        return schema;
      default:
        return null;
    }
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
   * Возвращает даты в формате ClickHouse DateTime64: YYYY-MM-DD HH:mm:ss.SSS
   */
  private extractTemporalMetadata(entity: FTMEntity): {
    first_seen?: string;
    last_changed?: string;
  } {
    const formatForClickHouse = (date: Date): string =>
      date.toISOString().replace('T', ' ').replace('Z', '');

    if (!entity.first_seen) {
      return {};
    }

    return {
      first_seen: formatForClickHouse(new Date(entity.first_seen)),
      last_changed: formatForClickHouse(
        entity.last_change
          ? new Date(entity.last_change)
          : new Date(entity.first_seen)
      )
    };
  }

  /**
   * Проверяет является ли row StagingEntity
   *
   * @remarks
   * Type guard for unified staging entities.
   */
  isStagingEntityRow(row: unknown): row is StagingEntityRow {
    if (typeof row !== 'object' || row === null) {
      return false;
    }

    const r = row as Record<string, unknown>;
    return (
      'schema' in r &&
      typeof r.schema === 'string' &&
      (r.schema === 'Company' ||
        r.schema === 'Organization' ||
        r.schema === 'LegalEntity' ||
        r.schema === 'Person')
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
