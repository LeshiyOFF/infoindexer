"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericMetadataParser = void 0;
const value_objects_1 = require("../../../value-objects");
/**
 * Numeric-style парсер метаданных
 *
 * @remarks
 * Поддерживает формат:
 * -- Migration 001: Create resume_states table
 * -- Purpose: Store HTTP download state for Range resume support
 * -- Architecture: ReplacingMergeTree with TTL for auto-cleanup
 */
class NumericMetadataParser {
    /**
     * Проверяет поддерживается ли формат
     *
     * @param content - Содержимое SQL файла
     * @returns true если это Numeric-style формат
     */
    supports(content) {
        // Проверяем наличие паттерна -- Migration XXX: (без двоеточия после Migration)
        return /^--\s*Migration\s+\d{3}:/m.test(content);
    }
    /**
     * Парсит метаданные
     *
     * @param content - Содержимое SQL файла
     * @param filename - Имя файла
     * @returns Результат парсинга
     */
    parse(content, filename) {
        try {
            const { version, description } = this.extractFirstLine(content);
            return {
                success: true,
                metadata: {
                    version,
                    description: description || this.extractDescriptionFromFilename(filename),
                    format: value_objects_1.MetadataFormat.NUMERIC,
                    isValid: () => true,
                    hasExtendedMetadata: () => false
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Извлекает версию и описание из первой строки
     *
     * @param content - Содержимое SQL файла
     * @returns Версия и описание
     */
    extractFirstLine(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            // Паттерн: -- Migration 001: Description
            const match = line.match(/^--\s*Migration\s+(\d{3}):\s*(.+)$/);
            if (match) {
                return {
                    version: match[1],
                    description: match[2].trim()
                };
            }
        }
        // Если не найдено, возвращаем fallback
        return {
            version: '000',
            description: ''
        };
    }
    /**
     * Извлекает описание из имени файла (fallback)
     *
     * @param filename - Имя файла
     * @returns Описание
     */
    extractDescriptionFromFilename(filename) {
        const parts = filename.replace('.sql', '').split('_');
        parts.shift();
        return parts.join(' ').replace(/_/g, ' ') || 'Migration';
    }
}
exports.NumericMetadataParser = NumericMetadataParser;
