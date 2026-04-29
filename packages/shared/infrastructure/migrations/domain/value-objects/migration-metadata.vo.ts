/**
 * Migration Metadata Value Object
 *
 * @remarks
 * Value Object для хранения метаданных миграции.
 * Следует паттерну Value Object: иммутабельный, равенство по значению.
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */

/**
 * Формат метаданных в SQL файле
 *
 * @remarks
 * Enum для определения стратегии парсинга.
 */
export enum MetadataFormat {
  /** Stripe-style: -- Migration: XXX_description */
  STRIPE = 'stripe',

  /** Numeric-style: -- Migration XXX: Description */
  NUMERIC = 'numeric',

  /** Decorative-style: -- ═══ + -- Migration XXX: Description */
  DECORATIVE = 'decorative',

  /** Формат не определён */
  UNKNOWN = 'unknown'
}

/**
 * Метаданные миграции
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Содержит извлечённые из SQL комментариев метаданные.
 */
export class MigrationMetadata {
  readonly version: string;
  readonly description: string;
  readonly author?: string;
  readonly created?: string;
  readonly format: MetadataFormat;

  constructor(
    version: string,
    description: string,
    format: MetadataFormat = MetadataFormat.UNKNOWN,
    author?: string,
    created?: string
  ) {
    this.version = version;
    this.description = description;
    this.format = format;
    this.author = author;
    this.created = created;
    Object.freeze(this);
  }

  /**
   * Создаёт метаданные из сырых данных
   *
   * @param data - Сырые данные
   * @returns MigrationMetadata
   */
  static fromRaw(data: {
    version: string;
    description: string;
    format?: MetadataFormat;
    author?: string;
    created?: string;
  }): MigrationMetadata {
    return new MigrationMetadata(
      data.version,
      data.description,
      data.format ?? MetadataFormat.UNKNOWN,
      data.author,
      data.created
    );
  }

  /**
   * Создаёт метаданные с fallback из имени файла
   *
   * @param filename - Имя файла (XXX_description.sql)
   * @returns MigrationMetadata с описанием из имени файла
   */
  static fromFilename(filename: string): MigrationMetadata {
    const version = filename.split('_')[0];
    const description = filename
      .replace('.sql', '')
      .split('_')
      .slice(1)
      .join(' ')
      .replace(/_/g, ' ');

    return new MigrationMetadata(
      version,
      description || `Migration ${version}`,
      MetadataFormat.UNKNOWN
    );
  }

  /**
   * Проверяет наличие обязательных полей
   */
  isValid(): boolean {
    return (
      this.version.length > 0 &&
      this.description.length > 0
    );
  }

  /**
   * Проверяет наличие опциональных полей
   */
  hasExtendedMetadata(): boolean {
    return (
      this.author !== undefined ||
      this.created !== undefined
    );
  }
}
