/**
 * Fallback Metadata Parser Strategy
 *
 * @remarks
 * Fallback парсер, который всегда успешно парсит.
 * Извлекает метаданные только из имени файла.
 *
 * @pattern Strategy Pattern
 * @pattern Null Object Pattern
 */
import type { IMetadataParser, MetadataParseResult } from '../../../ports';
/**
 * Fallback парсер метаданных
 *
 * @remarks
 * Используется когда ни одна другая стратегия не подошла.
 * Гарантирует успешный парсинг за счёт extraction из filename.
 */
export declare class FallbackMetadataParser implements IMetadataParser {
    /**
     * Всегда поддерживается (fallback стратегия)
     *
     * @param _content - Содержимое SQL файла (игнорируется)
     * @returns true всегда
     */
    supports(_content: string): boolean;
    /**
     * Парсит метаданные из имени файла
     *
     * @param _content - Содержимое SQL файла (игнорируется)
     * @param filename - Имя файла
     * @returns Результат парсинга (всегда успешный)
     */
    parse(_content: string, filename: string): MetadataParseResult;
    /**
     * Извлекает версию из имени файла
     *
     * @param filename - Имя файла (XXX_description.sql)
     * @returns Версия
     */
    private extractVersion;
    /**
     * Извлекает описание из имени файла
     *
     * @param filename - Имя файла
     * @returns Описание
     */
    private extractDescription;
}
