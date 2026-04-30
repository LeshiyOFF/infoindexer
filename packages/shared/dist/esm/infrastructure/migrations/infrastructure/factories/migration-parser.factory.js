import { StripeMetadataParser, NumericMetadataParser, DecorativeMetadataParser, FallbackMetadataParser } from '../../domain/services/parsers';
/**
 * Factory для создания парсеров метаданных
 *
 * @remarks
 * Централизует создание стратегий парсинга.
 * Упрощает тестирование через переопределение.
 */
export class MigrationParserFactory {
    /**
     * Создаёт Stripe-style парсер
     *
     * @returns StripeMetadataParser
     */
    createStripeParser() {
        return new StripeMetadataParser();
    }
    /**
     * Создаёт Numeric-style парсер
     *
     * @returns NumericMetadataParser
     */
    createNumericParser() {
        return new NumericMetadataParser();
    }
    /**
     * Создаёт Decorative-style парсер
     *
     * @returns DecorativeMetadataParser
     */
    createDecorativeParser() {
        return new DecorativeMetadataParser();
    }
    /**
     * Создаёт Fallback парсер
     *
     * @returns FallbackMetadataParser
     */
    createFallbackParser() {
        return new FallbackMetadataParser();
    }
    /**
     * Создаёт все стратегии в порядке приоритета
     *
     * @returns Список стратегий
     *
     * @remarks
     * Порядок важен для корректной работы стратегии.
     */
    createAll() {
        return [
            this.createStripeParser(),
            this.createNumericParser(),
            this.createDecorativeParser(),
            this.createFallbackParser()
        ];
    }
    /**
     * Создаёт фабрику с настройками по умолчанию
     *
     * @returns MigrationParserFactory
     */
    static createDefault() {
        return new MigrationParserFactory();
    }
}
