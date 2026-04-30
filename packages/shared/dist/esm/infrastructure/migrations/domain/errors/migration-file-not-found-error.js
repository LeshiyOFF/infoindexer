"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationFileNotFoundError = void 0;
const migration_error_1 = require("./migration-error");
/**
 * Ошибка отсутствия файла миграции
 *
 * @remarks
 * Выбрасывается когда файл не найден в файловой системе.
 */
class MigrationFileNotFoundError extends migration_error_1.MigrationError {
    filepath;
    constructor(category, version, filepath, cause) {
        super(`Migration file not found: ${filepath}`, category, version, cause);
        this.name = 'MigrationFileNotFoundError';
        this.filepath = filepath;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MigrationFileNotFoundError);
        }
    }
}
exports.MigrationFileNotFoundError = MigrationFileNotFoundError;
