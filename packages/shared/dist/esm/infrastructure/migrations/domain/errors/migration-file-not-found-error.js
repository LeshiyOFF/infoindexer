import { MigrationError } from './migration-error';
/**
 * Ошибка отсутствия файла миграции
 *
 * @remarks
 * Выбрасывается когда файл не найден в файловой системе.
 */
export class MigrationFileNotFoundError extends MigrationError {
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
