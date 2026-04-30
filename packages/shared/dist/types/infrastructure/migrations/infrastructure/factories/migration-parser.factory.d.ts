/**
 * Migration Parser Factory
 *
 * @remarks
 * Factory для создания стратегий парсинга метаданных.
 * Следует Factory pattern.
 *
 * @pattern Factory
 * @pattern Single Responsibility Principle
 */
import type { IMetadataParser } from '../../domain/ports';
/**
 * Factory для создания парсеров метаданных
 *
 * @remarks
 * Централизует создание стратегий парсинга.
 * Упрощает тестирование через переопределение.
 */
export declare class MigrationParserFactory {
    /**
     * Создаёт Stripe-style парсер
     *
     * @returns StripeMetadataParser
     */
    createStripeParser(): IMetadataParser;
    /**
     * Создаёт Numeric-style парсер
     *
     * @returns NumericMetadataParser
     */
    createNumericParser(): IMetadataParser;
    /**
     * Создаёт Decorative-style парсер
     *
     * @returns DecorativeMetadataParser
     */
    createDecorativeParser(): IMetadataParser;
    /**
     * Создаёт Fallback парсер
     *
     * @returns FallbackMetadataParser
     */
    createFallbackParser(): IMetadataParser;
    /**
     * Создаёт все стратегии в порядке приоритета
     *
     * @returns Список стратегий
     *
     * @remarks
     * Порядок важен для корректной работы стратегии.
     */
    createAll(): readonly IMetadataParser[];
    /**
     * Создаёт фабрику с настройками по умолчанию
     *
     * @returns MigrationParserFactory
     */
    static createDefault(): MigrationParserFactory;
}
