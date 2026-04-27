/**
 * Migration Descriptor Value Object
 *
 * @remarks
 * Value Object: неизменяемое описание миграции.
 * Следует иммутабельности: readonly свойства.
 */
/**
 * Категория миграции
 *
 * @remarks
 * Определяет к какому воркеру относится миграция.
 */
export type MigrationCategory = 'shared' | 'sync-worker' | 'egrul-sync-worker';
/**
 * Дескриптор миграции
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Содержит всю необходимую информацию о миграции.
 */
export interface MigrationDescriptor {
    /** Уникальный идентификатор (например, '001', '002') */
    readonly version: string;
    /** Имя SQL файла */
    readonly file: string;
    /** Человеческое описание */
    readonly description: string;
    /** Категория миграции */
    readonly category: MigrationCategory;
}
/**
 * Создаёт дескриптор миграции
 *
 * @param version - Версия миграции
 * @param file - Имя SQL файла
 * @param description - Описание
 * @param category - Категория
 * @returns Дескриптор миграции
 *
 * @remarks
 * Factory function для создания MigrationDescriptor.
 * Обеспечивает типобезопасность.
 */
export declare function createMigrationDescriptor(version: string, file: string, description: string, category: MigrationCategory): MigrationDescriptor;
