/**
 * Stripe-style Metadata Parser Strategy
 *
 * @remarks
 * Парсер для Stripe-style формата метаданных:
 * -- Migration: XXX_description
 * -- Description: ...
 * -- Category: ...
 *
 * @pattern Strategy Pattern
 * @pattern Single Responsibility Principle
 */
import type { IMetadataParser, MetadataParseResult } from '../../../ports';
/**
 * Stripe-style парсер метаданных
 *
 * @remarks
 * Поддерживает формат:
 * -- Migration: 017_backup_and_drop_mvs
 * -- Description: Backup and Drop Problematic Materialized Views
 * -- Category: egrul-sync-worker
 * -- Author: LeshiyOFF
 * -- Created: 2026-04-29
 */
export declare class StripeMetadataParser implements IMetadataParser {
    /**
     * Проверяет поддерживается ли формат
     *
     * @param content - Содержимое SQL файла
     * @returns true если это Stripe-style формат
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
     * Извлекает метаданные из комментариев
     *
     * @param content - Содержимое SQL файла
     * @returns Метаданные
     */
    private extractMetadata;
    /**
     * Извлекает версию из метаданных или имени файла
     *
     * @param metadata - Метаданные
     * @param filename - Имя файла
     * @returns Версия миграции
     */
    private extractVersion;
    /**
     * Извлекает описание из имени файла (fallback)
     *
     * @param filename - Имя файла
     * @returns Описание
     */
    private extractDescriptionFromFilename;
}
