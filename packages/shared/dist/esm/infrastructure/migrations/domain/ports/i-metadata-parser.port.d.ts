/**
 * Port: IMetadataParser
 *
 * @remarks
 * Абстракция для парсинга метаданных из SQL комментариев.
 * Следует Strategy pattern - разные форматы = разные стратегии.
 *
 * @pattern Strategy Pattern
 * @pattern Open/Closed Principle
 */
import type { MigrationMetadata } from '../value-objects';
/**
 * Результат парсинга метаданных
 *
 * @remarks
 * Value Object с readonly свойствами.
 */
export interface MetadataParseResult {
    /** Успешность парсинга */
    readonly success: boolean;
    /** Метаданные (при успехе) */
    readonly metadata?: MigrationMetadata;
    /** Ошибка (при неудаче) */
    readonly error?: string;
}
/**
 * Port для парсинга метаданных миграций
 *
 * @remarks
 * Определяет контракт для извлечения метаданных из SQL комментариев.
 * Каждая реализация отвечает за свой формат метаданных.
 *
 * @pattern Strategy Pattern
 * @pattern Single Responsibility Principle
 */
export interface IMetadataParser {
    /**
     * Парсит метаданные из содержимого SQL файла
     *
     * @param content - Содержимое SQL файла
     * @param filename - Имя файла (для fallback)
     * @returns Результат парсинга
     *
     * @remarks
     * - Extract metadata from SQL comments
     * - Использует filename как fallback если metadata отсутствует
     * - Возвращает error если формат не поддерживается
     */
    parse(content: string, filename: string): MetadataParseResult;
    /**
     * Проверяет поддерживается ли формат
     *
     * @param content - Содержимое SQL файла
     * @returns true если формат поддерживается
     *
     * @remarks
     * Быстрая проверка без полного парсинга.
     * Используется для выбора стратегии.
     */
    supports(content: string): boolean;
}
