/**
 * Migration Metadata Parser Service
 *
 * @remarks
 * Оркестратор парсинга метаданных из SQL файлов.
 * Использует Strategy pattern для выбора подходящего парсера.
 *
 * @pattern Strategy Pattern
 * @pattern Single Responsibility Principle
 * @pattern Open/Closed Principle
 */
import type { IMetadataParser } from '../../ports';
import type { MigrationMetadata } from '../../value-objects';
/**
 * Параметры для создания MigrationMetadataParser
 */
export interface MigrationMetadataParserParams {
    /** Кастомные стратегии (опционально) */
    readonly strategies?: readonly IMetadataParser[];
}
/**
 * Сервис парсинга метаданных миграций
 *
 * @remarks
 * Координирует работу стратегий парсинга.
 * Проверяет каждую стратегию по очереди, использует первую подошедшую.
 * Гарантирует успешный парсинг за счёт Fallback стратегии.
 */
export declare class MigrationMetadataParser {
    private readonly strategies;
    constructor(params?: MigrationMetadataParserParams);
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
    parse(content: string, filename: string): MigrationMetadata;
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
    private getDefaultStrategies;
    /**
     * Создаёт парсер для тестирования
     *
     * @param strategies - Мок стратегии
     * @returns Парсер с переопределёнными стратегиями
     */
    static forTesting(strategies: readonly IMetadataParser[]): MigrationMetadataParser;
}
