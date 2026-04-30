"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidMetadataError = void 0;
const migration_error_1 = require("./migration-error");
/**
 * Ошибка некорректных метаданных
 *
 * @remarks
 * Выбрасывается при:
 * - Неверном формате версии
 * - Отсутствии обязательных полей
 * - Несоответствии имени файла и метаданных
 */
class InvalidMetadataError extends migration_error_1.MigrationError {
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
exports.InvalidMetadataError = InvalidMetadataError;
