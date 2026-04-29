/**
 * Migration SQL Reader
 *
 * @remarks
 * Value Object для чтения SQL файлов миграций.
 * Вынесен из MigrationApplierService для соблюдения лимита строк.
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import type { MigrationDescriptor, MigrationCategory } from '../value-objects';

/**
 * Читатель SQL файлов миграций
 *
 * @remarks
 * VO для чтения SQL файлов из файловой системы.
 */
export class MigrationSqlReader {
  constructor(private readonly migrationsBaseDir: string) {}

  /**
   * Читает SQL файл миграции
   *
   * @param descriptor - Дескриптор миграции
   * @returns Содержимое SQL файла
   */
  read(descriptor: MigrationDescriptor): string {
    const categoryDir = this.getCategoryDir(descriptor.category);
    const filepath = join(categoryDir, descriptor.file);
    return readFileSync(filepath, 'utf-8');
  }

  /**
   * Получает директорию категории
   *
   * @param category - Категория
   * @returns Путь к директории
   */
  private getCategoryDir(category: MigrationCategory): string {
    return join(this.migrationsBaseDir, category);
  }
}
