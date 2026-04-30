import { MetadataFormat } from '../../../value-objects';
/**
 * Fallback парсер метаданных
 *
 * @remarks
 * Используется когда ни одна другая стратегия не подошла.
 * Гарантирует успешный парсинг за счёт extraction из filename.
 */
export class FallbackMetadataParser {
    /**
     * Всегда поддерживается (fallback стратегия)
     *
     * @param _content - Содержимое SQL файла (игнорируется)
     * @returns true всегда
     */
    supports(_content) {
        return true;
    }
    /**
     * Парсит метаданные из имени файла
     *
     * @param _content - Содержимое SQL файла (игнорируется)
     * @param filename - Имя файла
     * @returns Результат парсинга (всегда успешный)
     */
    parse(_content, filename) {
        const version = this.extractVersion(filename);
        const description = this.extractDescription(filename);
        return {
            success: true,
            metadata: {
                version,
                description,
                format: MetadataFormat.UNKNOWN,
                isValid: () => true,
                hasExtendedMetadata: () => false
            }
        };
    }
    /**
     * Извлекает версию из имени файла
     *
     * @param filename - Имя файла (XXX_description.sql)
     * @returns Версия
     */
    extractVersion(filename) {
        const match = filename.match(/^(\d{3})_/);
        return match ? match[1] : '000';
    }
    /**
     * Извлекает описание из имени файла
     *
     * @param filename - Имя файла
     * @returns Описание
     */
    extractDescription(filename) {
        const parts = filename.replace('.sql', '').split('_');
        parts.shift();
        return parts.join(' ').replace(/_/g, ' ') || 'Migration';
    }
}
