import { MetadataFormat } from '../../../value-objects';
/**
 * Decorative-style парсер метаданных
 *
 * @remarks
 * Поддерживает формат с decorative lines:
 * -- ═════════════════════════════════
 * -- Migration 017: Backup and Drop Problematic Materialized Views
 * -- ═════════════════════════════════
 */
export class DecorativeMetadataParser {
    static DECORATIVE_PATTERN = /^─+|═+$/;
    /**
     * Проверяет поддерживается ли формат
     *
     * @param content - Содержимое SQL файла
     * @returns true если это Decorative-style формат
     */
    supports(content) {
        const lines = content.split('\n').slice(0, 10);
        // Проверяем наличие decorative lines
        const hasDecorative = lines.some(line => /^--\s*[─═]+$/.test(line));
        // Проверяем наличие миграционной строки после decorative
        const hasMigration = lines.some(line => /^--\s*Migration\s+\d{3}:/.test(line));
        return hasDecorative && hasMigration;
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
            const { version, description } = this.extractFromDecorative(content);
            return {
                success: true,
                metadata: {
                    version,
                    description: description || this.extractDescriptionFromFilename(filename),
                    format: MetadataFormat.DECORATIVE,
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
     * Извлекает версию и описание из decorative формата
     *
     * @param content - Содержимое SQL файла
     * @returns Версия и описание
     */
    extractFromDecorative(content) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Пропускаем decorative lines
            if (this.isDecorativeLine(line)) {
                continue;
            }
            // Ищем миграционную строку
            const match = line.match(/^--\s*Migration\s+(\d{3}):\s*(.+)$/);
            if (match) {
                return {
                    version: match[1],
                    description: match[2].trim()
                };
            }
        }
        return {
            version: '000',
            description: ''
        };
    }
    /**
     * Проверяет является ли строка decorative
     *
     * @param line - Строка
     * @returns true если это decorative line
     */
    isDecorativeLine(line) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('--')) {
            return false;
        }
        const content = trimmed.substring(2).trim();
        return DecorativeMetadataParser.DECORATIVE_PATTERN.test(content);
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
