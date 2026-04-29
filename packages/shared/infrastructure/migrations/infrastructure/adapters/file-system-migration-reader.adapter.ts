/**
 * File System Migration Reader Adapter
 *
 * @remarks
 * Реализация IMigrationFileReader для Node.js файловой системы.
 * Следует Adapter pattern из Hexagonal Architecture.
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Single Responsibility Principle
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  IMigrationFileReader,
  MigrationFileContent
} from '../../domain/ports';
import type { MigrationCategory } from '../../domain/value-objects';

/**
 * Параметры для создания FileSystemMigrationReaderAdapter
 */
export interface FileSystemMigrationReaderAdapterParams {
  /** Базовая директория с миграциями */
  readonly migrationsBaseDir: string;

  /** Соответствие категории к поддиректории */
  readonly categoryDirs?: Readonly<Record<MigrationCategory, string>>;
}

/**
 * Адаптер для чтения миграционных файлов из файловой системы
 *
 * @remarks
 * Реализует Port IMigrationFileReader используя Node.js fs API.
 * Отвечает только за работу с файловой системой.
 */
export class FileSystemMigrationReaderAdapter implements IMigrationFileReader {
  private readonly migrationsBaseDir: string;
  private readonly categoryDirs: Readonly<Record<MigrationCategory, string>>;

  constructor(params: FileSystemMigrationReaderAdapterParams) {
    this.migrationsBaseDir = params.migrationsBaseDir;
    this.categoryDirs = params.categoryDirs ?? this.getDefaultCategoryDirs();
  }

  /**
   * Получает список SQL файлов для категории
   *
   * @param category - Категория миграции
   * @returns Отсортированный список имён файлов
   *
   * @remarks
   * - Фильтрует по маске: XXX_description.sql
   * - Сортирует alphabetically (000, 001, ...)
   * - Возвращает пустой массив если директория не существует
   */
  async listFiles(category: MigrationCategory): Promise<readonly string[]> {
    const categoryDir = this.getCategoryDir(category);

    if (!existsSync(categoryDir)) {
      return [];
    }

    const files = readdirSync(categoryDir)
      .filter(file => this.isValidMigrationFile(file))
      .sort(); // Alphabetical sort = chronological for zero-padded numbers

    return files;
  }

  /**
   * Читает содержимое файла миграции
   *
   * @param category - Категория миграции
   * @param filename - Имя файла
   * @returns Содержимое файла и путь
   * @throws {Error} если файл не существует
   */
  async readFile(
    category: MigrationCategory,
    filename: string
  ): Promise<MigrationFileContent> {
    const filepath = this.getFilepath(category, filename);

    if (!existsSync(filepath)) {
      throw new Error(`Migration file not found: ${filepath}`);
    }

    const content = readFileSync(filepath, 'utf-8');

    return {
      content,
      filepath
    };
  }

  /**
   * Проверяет существование файла
   *
   * @param category - Категория миграции
   * @param filename - Имя файла
   * @returns true если файл существует
   */
  async exists(
    category: MigrationCategory,
    filename: string
  ): Promise<boolean> {
    const filepath = this.getFilepath(category, filename);
    return existsSync(filepath);
  }

  /**
   * Проверяет валидность имени файла миграции
   *
   * @param filename - Имя файла
   * @returns true если соответствует маске XXX_description.sql
   *
   * @remarks
   * Маска: три цифры, подчёркивание, описание, .sql
   */
  private isValidMigrationFile(filename: string): boolean {
    return /^\d{3}_.+\.sql$/.test(filename);
  }

  /**
   * Получает полный путь к файлу
   *
   * @param category - Категория миграции
   * @param filename - Имя файла
   * @returns Полный путь
   */
  private getFilepath(category: MigrationCategory, filename: string): string {
    const categoryDir = this.getCategoryDir(category);
    return join(categoryDir, filename);
  }

  /**
   * Получает директорию для категории
   *
   * @param category - Категория миграции
   * @returns Полный путь к директории
   */
  private getCategoryDir(category: MigrationCategory): string {
    const subdir = this.categoryDirs[category];
    return join(this.migrationsBaseDir, subdir);
  }

  /**
   * Получает соответствие категорий к директориям по умолчанию
   *
   * @returns Соответствие категорий
   */
  private getDefaultCategoryDirs(): Record<MigrationCategory, string> {
    return {
      shared: 'shared',
      'sync-worker': 'sync-worker',
      'egrul-sync-worker': 'egrul-sync-worker'
    };
  }
}
