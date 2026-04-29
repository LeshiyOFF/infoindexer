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
import { MetadataFormat } from '../../../value-objects';

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
export class StripeMetadataParser implements IMetadataParser {
  /**
   * Проверяет поддерживается ли формат
   *
   * @param content - Содержимое SQL файла
   * @returns true если это Stripe-style формат
   */
  supports(content: string): boolean {
    // Проверяем наличие паттерна -- Migration: XXX_
    return /^--\s*Migration:\s*\d{3}_.+/m.test(content);
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
      const metadata = this.extractMetadata(content);
      const version = this.extractVersion(metadata, filename);

      return {
        success: true,
        metadata: {
          version,
          description: metadata.description || this.extractDescriptionFromFilename(filename),
          format: MetadataFormat.STRIPE,
          author: metadata.author,
          created: metadata.created,
          isValid: () => true,
          hasExtendedMetadata: () => !!metadata.author || !!metadata.created
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
   * Извлекает метаданные из комментариев
   *
   * @param content - Содержимое SQL файла
   * @returns Метаданные
   */
  private extractMetadata(content: string): StripeMetadata {
    const metadata: StripeMetadata = {
      migration: '',
      description: '',
      category: '',
      author: '',
      created: ''
    };

    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^--\s*(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        if (key in metadata) {
          metadata[key as keyof StripeMetadata] = value.trim();
        }
      }
    }

    return metadata;
  }

  /**
   * Извлекает версию из метаданных или имени файла
   *
   * @param metadata - Метаданные
   * @param filename - Имя файла
   * @returns Версия миграции
   */
  private extractVersion(metadata: StripeMetadata, filename: string): string {
    // Приоритет: metadata.migration > filename
    if (metadata.migration) {
      const match = metadata.migration.match(/^(\d{3})_/);
      if (match) {
        return match[1];
      }
    }

    // Fallback: извлекаем из имени файла
    const fileMatch = filename.match(/^(\d{3})_/);
    if (fileMatch) {
      return fileMatch[1];
    }

    return '000';
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

/**
 * Внутренний интерфейс для метаданных Stripe-style
 */
interface StripeMetadata {
  migration: string;
  description: string;
  category: string;
  author: string;
  created: string;
}
