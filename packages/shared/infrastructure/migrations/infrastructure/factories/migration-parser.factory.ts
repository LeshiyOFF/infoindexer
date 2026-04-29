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
import {
  StripeMetadataParser,
  NumericMetadataParser,
  DecorativeMetadataParser,
  FallbackMetadataParser
} from '../../domain/services/parsers';

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
  createStripeParser(): IMetadataParser {
    return new StripeMetadataParser();
  }

  /**
   * Создаёт Numeric-style парсер
   *
   * @returns NumericMetadataParser
   */
  createNumericParser(): IMetadataParser {
    return new NumericMetadataParser();
  }

  /**
   * Создаёт Decorative-style парсер
   *
   * @returns DecorativeMetadataParser
   */
  createDecorativeParser(): IMetadataParser {
    return new DecorativeMetadataParser();
  }

  /**
   * Создаёт Fallback парсер
   *
   * @returns FallbackMetadataParser
   */
  createFallbackParser(): IMetadataParser {
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
  createAll(): readonly IMetadataParser[] {
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
  static createDefault(): MigrationParserFactory {
    return new MigrationParserFactory();
  }
}
