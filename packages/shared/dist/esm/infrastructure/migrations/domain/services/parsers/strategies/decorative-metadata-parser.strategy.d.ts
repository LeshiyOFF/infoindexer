/**
 * Decorative-style Metadata Parser Strategy
 *
 * @remarks
 * Парсер для Decorative-style формата метаданных:
 * -- ═════════════════════════════════
 * -- Migration 017: Backup and Drop MVs
 * -- ═════════════════════════════════
 *
 * @pattern Strategy Pattern
 * @pattern Single Responsibility Principle
 */
import type { IMetadataParser, MetadataParseResult } from '../../../ports';
/**
 * Decorative-style парсер метаданных
 *
 * @remarks
 * Поддерживает формат с decorative lines:
 * -- ═════════════════════════════════
 * -- Migration 017: Backup and Drop Problematic Materialized Views
 * -- ═════════════════════════════════
 */
export declare class DecorativeMetadataParser implements IMetadataParser {
    private static readonly DECORATIVE_PATTERN;
    /**
     * Проверяет поддерживается ли формат
     *
     * @param content - Содержимое SQL файла
     * @returns true если это Decorative-style формат
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
     * Извлекает версию и описание из decorative формата
     *
     * @param content - Содержимое SQL файла
     * @returns Версия и описание
     */
    private extractFromDecorative;
    /**
     * Проверяет является ли строка decorative
     *
     * @param line - Строка
     * @returns true если это decorative line
     */
    private isDecorativeLine;
    /**
     * Извлекает описание из имени файла (fallback)
     *
     * @param filename - Имя файла
     * @returns Описание
     */
    private extractDescriptionFromFilename;
}
