import { StripeMetadataParser, NumericMetadataParser, DecorativeMetadataParser, FallbackMetadataParser } from './strategies';
/**
 * Сервис парсинга метаданных миграций
 *
 * @remarks
 * Координирует работу стратегий парсинга.
 * Проверяет каждую стратегию по очереди, использует первую подошедшую.
 * Гарантирует успешный парсинг за счёт Fallback стратегии.
 */
export class MigrationMetadataParser {
    strategies;
    constructor(params) {
        // Внедряем зависимости с возможностью переопределения (testing)
        this.strategies = params?.strategies ?? this.getDefaultStrategies();
    }
    /**
     * Парсит метаданные из содержимого SQL файла
     *
     * @param content - Содержимое SQL файла
     * @param filename - Имя файла
     * @returns Метаданные миграции
     * @throws {Error} если ни одна стратегия не справилась
     *
     * @remarks
     * - Перебирает стратегии по порядку
     * - Использует первую, что поддерживает формат
     * - Fallback стратегия всегда успешна
     */
    parse(content, filename) {
        for (const strategy of this.strategies) {
            if (strategy.supports(content)) {
                const result = strategy.parse(content, filename);
                if (result.success && result.metadata) {
                    return result.metadata;
                }
                // Если стратегия поддерживает но не смогла распарсить - логируем и продолжаем
                console.warn(`[MigrationMetadataParser] Strategy ${strategy.constructor.name} ` +
                    `supports format but failed to parse: ${result.error}`);
            }
        }
        // Fallback: всегда должны получить результат благодаря FallbackMetadataParser
        throw new Error(`Failed to parse metadata from file: ${filename}. ` +
            `This should never happen due to fallback strategy.`);
    }
    /**
     * Получает стратегии по умолчанию
     *
     * @returns Список стратегий в порядке приоритета
     *
     * @remarks
     * Порядок важен:
     * 1. Stripe - наиболее структурированный
     * 2. Numeric - частый формат
     * 3. Decorative - редкий формат
     * 4. Fallback - всегда успешен
     */
    getDefaultStrategies() {
        return [
            new StripeMetadataParser(),
            new NumericMetadataParser(),
            new DecorativeMetadataParser(),
            new FallbackMetadataParser()
        ];
    }
    /**
     * Создаёт парсер для тестирования
     *
     * @param strategies - Мок стратегии
     * @returns Парсер с переопределёнными стратегиями
     */
    static forTesting(strategies) {
        return new MigrationMetadataParser({ strategies });
    }
}
