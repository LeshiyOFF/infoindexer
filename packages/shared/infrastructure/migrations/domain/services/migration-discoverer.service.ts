/**
 * Migration Discoverer Service
 *
 * @remarks
 * Сервис для обнаружения миграций из файловой системы.
 * Реализует IMigrationDiscoverer port.
 *
 * v2.1: Вынесен из UnifiedMigrationService для соблюдения SRP.
 *
 * @pattern Single Responsibility Principle (только обнаружение)
 * @pattern Dependency Inversion Principle (зависит от MetadataParser)
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { IMigrationDiscoverer } from '../ports/i-migration-discoverer.port';
import type { MigrationDescriptor } from '../value-objects/migration-descriptor.vo';
import type { MigrationCategory } from '../value-objects/migration-descriptor.vo';
import { MigrationMetadataParser } from './parsers';
import { LEGACY_MIGRATION_DESCRIPTORS } from './legacy';

/**
 * Категории миграций для сканирования
 */
const MIGRATION_CATEGORIES: readonly MigrationCategory[] = [
  'shared',
  'sync-worker',
  'egrul-sync-worker'
] as const;

/**
 * Порядок категорий для вторичной сортировки (при равных версиях)
 *
 * @remarks
 * Shared миграции должны идти первыми, затем app-specific.
 * Это гарантирует что shared инфраструктура готова до запуска domain логики.
 */
const CATEGORY_ORDER: Readonly<Record<MigrationCategory, number>> = {
  'shared': 0,
  'sync-worker': 1,
  'egrul-sync-worker': 2
} as const;

/**
 * Сервис обнаружения миграций
 *
 * @remarks
 * Отвечает только за сканирование файловой системы
 * и построение дескрипторов миграций.
 */
export class MigrationDiscovererService implements IMigrationDiscoverer {
  private readonly categories = MIGRATION_CATEGORIES;

  constructor(
    private readonly metadataParser: MigrationMetadataParser,
    private readonly migrationsBaseDir: string
  ) {}

  /**
   * Обнаруживает все миграции
   *
   * @returns Отсортированный список дескрипторов
   */
  discover(): ReadonlyArray<MigrationDescriptor> {
    return this.discoverWithFallback();
  }

  /**
   * Обнаруживает с fallback на legacy
   *
   * @returns Отсортированные дескрипторы
   */
  private discoverWithFallback(): ReadonlyArray<MigrationDescriptor> {
    const discovered = this.scanFilesystem();

    if (discovered.length === 0) {
      console.warn(
        '[MigrationDiscoverer] No migrations discovered, using LEGACY fallback'
      );
      return this.sortByVersion(LEGACY_MIGRATION_DESCRIPTORS);
    }

    console.log(
      `[MigrationDiscoverer] Discovered ${discovered.length} migrations`
    );
    return this.sortByVersion(discovered);
  }

  /**
   * Сканирует файловую систему
   *
   * @returns Дескрипторы из ФС
   */
  private scanFilesystem(): MigrationDescriptor[] {
    const descriptors: MigrationDescriptor[] = [];

    for (const category of this.categories) {
      const categoryDescriptors = this.scanCategory(category);
      descriptors.push(...categoryDescriptors);
    }

    return descriptors;
  }

  /**
   * Сканирует категорию
   *
   * @param category - Категория миграции
   * @returns Дескрипторы категории
   */
  private scanCategory(category: MigrationCategory): MigrationDescriptor[] {
    const descriptors: MigrationDescriptor[] = [];
    const categoryDir = join(this.migrationsBaseDir, category);

    if (!existsSync(categoryDir)) {
      return descriptors;
    }

    try {
      const files = this.listSqlFiles(categoryDir);

      for (const file of files) {
        const descriptor = this.parseFile(category, file);
        descriptors.push(descriptor);
      }
    } catch (error) {
      console.warn(
        `[MigrationDiscoverer] Failed to scan ${category}:`,
        error instanceof Error ? error.message : String(error)
      );
    }

    return descriptors;
  }

  /**
   * Получает список SQL файлов
   *
   * @param dir - Директория
   * @returns Отсортированный список файлов
   */
  private listSqlFiles(dir: string): string[] {
    return readdirSync(dir)
      .filter((file: string) => /^\d{3}_.+\.sql$/.test(file))
      .sort();
  }

  /**
   * Парсит файл миграции
   *
   * @param category - Категория
   * @param filename - Имя файла
   * @returns Дескриптор миграции
   */
  private parseFile(
    category: MigrationCategory,
    filename: string
  ): MigrationDescriptor {
    const filepath = join(this.migrationsBaseDir, category, filename);
    const content = readFileSync(filepath, 'utf-8');

    const metadata = this.metadataParser.parse(content, filename);
    const version = this.extractVersion(filename);

    return {
      version,
      file: filename,
      description: metadata.description,
      category
    };
  }

  /**
   * Извлекает версию из имени файла
   *
   * @param filename - Имя файла
   * @returns Версия
   */
  private extractVersion(filename: string): string {
    return filename.split('_')[0];
  }

  /**
   * Сортирует дескрипторы по версии и категории
   *
   * @remarks
   * Двухуровневая сортировка:
   * 1. По версии (числовой префикс)
   * 2. При равных версиях — по категории (shared → sync-worker → egrul-sync-worker)
   *
   * Это гарантирует предсказуемый порядок миграций и решает проблему
   * cross-service зависимостей (например, shared/001 зависит от sync-worker/001).
   *
   * @param descriptors - Дескрипторы
   * @returns Отсортированные дескрипторы
   */
  private sortByVersion(
    descriptors: ReadonlyArray<MigrationDescriptor>
  ): ReadonlyArray<MigrationDescriptor> {
    return [...descriptors].sort((a, b) => {
      const versionA = parseInt(a.version, 10);
      const versionB = parseInt(b.version, 10);

      // Первичная сортировка по версии
      if (versionA !== versionB) {
        return versionA - versionB;
      }

      // Вторичная сортировка по категории (детерминированный порядок)
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    });
  }
}
