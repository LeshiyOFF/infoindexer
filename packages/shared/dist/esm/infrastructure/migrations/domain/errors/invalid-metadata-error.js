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
    metadataField;
    constructor(category, version, metadataField, message, cause) {
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
