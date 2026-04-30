/**
 * Legacy Migration Descriptors
 *
 * @remarks
 * Fallback дескрипторы для обратной совместимости.
 * Используются когда discoverMigrations() не нашёл файлов в ФС.
 *
 * v2.1: Вынесены из unified-migration.service.ts для соблюдения SRP.
 */
import type { MigrationDescriptor } from '../../value-objects';
/**
 * Legacy дескрипторы миграций
 *
 * @remarks
 * Массив с описанием миграций 000-016.
 * Используется как fallback при отсутствии файлов в ФС.
 */
export declare const LEGACY_MIGRATION_DESCRIPTORS: ReadonlyArray<MigrationDescriptor>;
