/**
 * Invalid Metadata Error
 *
 * @remarks
 * Ошибка валидации метаданных миграции.
 *
 * @pattern Domain Error
 * @pattern Single Responsibility Principle
 */
import type { MigrationCategory } from '../value-objects';
import { MigrationError } from './migration-error';

/**
 * Ошибка некорректных метаданных
 *
 * @remarks
 * Выбрасывается при:
 * - Неверном формате версии
 * - Отсутствии обязательных полей
 * - Несоответствии имени файла и метаданных
 */
export class InvalidMetadataError extends MigrationError {
  readonly metadataField?: string;

  constructor(
    category: MigrationCategory,
    version: string,
    metadataField?: string,
    message?: string,
    cause?: Error
  ) {
    const defaultMsg = metadataField
      ? `Invalid metadata field: ${metadataField}`
      : 'Invalid migration metadata';

    super(message || defaultMsg, category, version, cause);
    this.name = 'InvalidMetadataError';
    this.metadataField = metadataField;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidMetadataError);
    }
  }
}
