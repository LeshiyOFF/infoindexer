"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationParserFactory = void 0;
const parsers_1 = require("../../domain/services/parsers");
/**
 * Factory для создания парсеров метаданных
 *
 * @remarks
 * Централизует создание стратегий парсинга.
 * Упрощает тестирование через переопределение.
 */
class MigrationParserFactory {
    /**
     * Создаёт Stripe-style парсер
     *
     * @returns StripeMetadataParser
     */
    createStripeParser() {
        return new parsers_1.StripeMetadataParser();
    }
    /**
     * Создаёт Numeric-style парсер
     *
     * @returns NumericMetadataParser
     */
    createNumericParser() {
        return new parsers_1.NumericMetadataParser();
    }
    /**
     * Создаёт Decorative-style парсер
     *
     * @returns DecorativeMetadataParser
     */
    createDecorativeParser() {
        return new parsers_1.DecorativeMetadataParser();
    }
    /**
     * Создаёт Fallback парсер
     *
     * @returns FallbackMetadataParser
     */
    createFallbackParser() {
        return new parsers_1.FallbackMetadataParser();
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
exports.MigrationParserFactory = MigrationParserFactory;
