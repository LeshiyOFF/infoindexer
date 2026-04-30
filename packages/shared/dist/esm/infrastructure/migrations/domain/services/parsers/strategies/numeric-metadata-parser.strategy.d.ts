/**
 * Numeric-style Metadata Parser Strategy
 *
 * @remarks
 * Парсер для Numeric-style формата метаданных:
 * -- Migration 001: Create resume_states table
 * -- Purpose: Store HTTP download state
 *
 * @pattern Strategy Pattern
 * @pattern Single Responsibility Principle
 */
import type { IMetadataParser, MetadataParseResult } from '../../../ports';
/**
 * Numeric-style парсер метаданных
 *
 * @remarks
 * Поддерживает формат:
 * -- Migration 001: Create resume_states table
 * -- Purpose: Store HTTP download state for Range resume support
 * -- Architecture: ReplacingMergeTree with TTL for auto-cleanup
 */
export declare class NumericMetadataParser implements IMetadataParser {
    /**
     * Проверяет поддерживается ли формат
     *
     * @param content - Содержимое SQL файла
     * @returns true если это Numeric-style формат
     */
    supports(content: string): boolean;
    /**
     * Парсит метаданные
     *
     * @param content - Содержимое SQL файла
     * @param filename - Имя файла
     * @returns Результат парсинга
     */
    parse(content: string, filename: string): MetadataParseResult;
    /**
     * Извлекает версию и описание из первой строки
     *
     * @param content - Содержимое SQL файла
     * @returns Версия и описание
     */
    private extractFirstLine;
    /**
     * Извлекает описание из имени файла (fallback)
     *
     * @param filename - Имя файла
     * @returns Описание
     */
    private extractDescriptionFromFilename;
}
