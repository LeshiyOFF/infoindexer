/**
 * Migration Error Base Class
 *
 * @remarks
 * Базовый класс для всех ошибок миграций.
 * Следует паттерну Domain Error.
 *
 * @pattern Domain Error
 * @pattern Single Responsibility Principle
 */
import type { MigrationCategory } from '../value-objects';
/**
 * Базовая ошибка миграции
 *
 * @remarks
 * Содержит контекст (category, version) для идентификации проблемы.
 */
export declare class MigrationError extends Error {
    readonly category: MigrationCategory;
    readonly version: string;
    readonly cause?: Error;
    constructor(message: string, category: MigrationCategory, version: string, cause?: Error);
    /**
     * Формирует полное сообщение об ошибке
     */
    getFullMessage(): string;
}
