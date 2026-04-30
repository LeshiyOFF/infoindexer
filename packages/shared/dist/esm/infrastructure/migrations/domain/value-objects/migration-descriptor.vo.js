"use strict";
/**
 * Migration Descriptor Value Object
 *
 * @remarks
 * Value Object: неизменяемое описание миграции.
 * Следует иммутабельности: readonly свойства.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMigrationDescriptor = createMigrationDescriptor;
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
function createMigrationDescriptor(version, file, description, category) {
    return {
        version,
        file,
        description,
        category
    };
}
