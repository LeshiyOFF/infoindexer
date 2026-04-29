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
import { MetadataFormat } from '../../../value-objects';

/**
 * Fallback парсер метаданных
 *
 * @remarks
 * Используется когда ни одна другая стратегия не подошла.
 * Гарантирует успешный парсинг за счёт extraction из filename.
 */
export class FallbackMetadataParser implements IMetadataParser {
  /**
   * Всегда поддерживается (fallback стратегия)
   *
   * @param _content - Содержимое SQL файла (игнорируется)
   * @returns true всегда
   */
  supports(_content: string): boolean {
    return true;
  }

  /**
   * Парсит метаданные из имени файла
   *
   * @param _content - Содержимое SQL файла (игнорируется)
   * @param filename - Имя файла
   * @returns Результат парсинга (всегда успешный)
   */
  parse(_content: string, filename: string): MetadataParseResult {
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
  private extractVersion(filename: string): string {
    const match = filename.match(/^(\d{3})_/);
    return match ? match[1] : '000';
  }

  /**
   * Извлекает описание из имени файла
   *
   * @param filename - Имя файла
   * @returns Описание
   */
  private extractDescription(filename: string): string {
    const parts = filename.replace('.sql', '').split('_');
    parts.shift();
    return parts.join(' ').replace(/_/g, ' ') || 'Migration';
  }
}
