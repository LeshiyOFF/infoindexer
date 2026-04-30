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
export declare enum MetadataFormat {
    /** Stripe-style: -- Migration: XXX_description */
    STRIPE = "stripe",
    /** Numeric-style: -- Migration XXX: Description */
    NUMERIC = "numeric",
    /** Decorative-style: -- ═══ + -- Migration XXX: Description */
    DECORATIVE = "decorative",
    /** Формат не определён */
    UNKNOWN = "unknown"
}
/**
 * Метаданные миграции
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Содержит извлечённые из SQL комментариев метаданные.
 */
export declare class MigrationMetadata {
    readonly version: string;
    readonly description: string;
    readonly author?: string;
    readonly created?: string;
    readonly format: MetadataFormat;
    constructor(version: string, description: string, format?: MetadataFormat, author?: string, created?: string);
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
    }): MigrationMetadata;
    /**
     * Создаёт метаданные с fallback из имени файла
     *
     * @param filename - Имя файла (XXX_description.sql)
     * @returns MigrationMetadata с описанием из имени файла
     */
    static fromFilename(filename: string): MigrationMetadata;
    /**
     * Проверяет наличие обязательных полей
     */
    isValid(): boolean;
    /**
     * Проверяет наличие опциональных полей
     */
    hasExtendedMetadata(): boolean;
}
