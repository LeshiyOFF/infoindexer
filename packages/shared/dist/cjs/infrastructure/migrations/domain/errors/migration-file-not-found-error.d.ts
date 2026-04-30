/**
 * Migration File Not Found Error
 *
 * @remarks
 * Ошибка отсутствия файла миграции.
 *
 * @pattern Domain Error
 * @pattern Single Responsibility Principle
 */
import type { MigrationCategory } from '../value-objects';
import { MigrationError } from './migration-error';
/**
 * Ошибка отсутствия файла миграции
 *
 * @remarks
 * Выбрасывается когда файл не найден в файловой системе.
 */
export declare class MigrationFileNotFoundError extends MigrationError {
    readonly filepath: string;
    constructor(category: MigrationCategory, version: string, filepath: string, cause?: Error);
}
