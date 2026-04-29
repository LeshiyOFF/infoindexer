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
import { MetadataFormat } from '../../../value-objects';

/**
 * Numeric-style парсер метаданных
 *
 * @remarks
 * Поддерживает формат:
 * -- Migration 001: Create resume_states table
 * -- Purpose: Store HTTP download state for Range resume support
 * -- Architecture: ReplacingMergeTree with TTL for auto-cleanup
 */
export class NumericMetadataParser implements IMetadataParser {
  /**
   * Проверяет поддерживается ли формат
   *
   * @param content - Содержимое SQL файла
   * @returns true если это Numeric-style формат
   */
  supports(content: string): boolean {
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
  parse(content: string, filename: string): MetadataParseResult {
    try {
      const { version, description } = this.extractFirstLine(content);

      return {
        success: true,
        metadata: {
          version,
          description: description || this.extractDescriptionFromFilename(filename),
          format: MetadataFormat.NUMERIC,
          isValid: () => true,
          hasExtendedMetadata: () => false
        }
      };
    } catch (error) {
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
  private extractFirstLine(content: string): { version: string; description: string } {
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
  private extractDescriptionFromFilename(filename: string): string {
    const parts = filename.replace('.sql', '').split('_');
    parts.shift();
    return parts.join(' ').replace(/_/g, ' ') || 'Migration';
  }
}
