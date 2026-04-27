/**
 * Утилита для маппинга имён колонок
 *
 * @remarks
 * Парсит CSV файл с правилами переименования колонок.
 */

import fs from 'fs';
import path from 'path';

/**
 * Карта для маппинга имён колонок
 */
export type ColumnNameMap = Readonly<Record<string, string>>;

/**
 * Утилита для маппинга имён колонок
 */
export class NameMapperUtil {
  private readonly map: ColumnNameMap;

  constructor(csvPath: string) {
    this.map = this.parseCsv(csvPath);
  }

  /**
   * Получает маппинг имён колонок
   */
  getMap(): ColumnNameMap {
    return this.map;
  }

  /**
   * Преобразует имя колонки по карте
   */
  mapName(original: string): string {
    return this.map[original] || original;
  }

  /**
   * Парсит CSV файл с правилами маппинга
   */
  private parseCsv(csvPath: string): ColumnNameMap {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    const dict: Record<string, string> = {};
    const seen: Record<string, number> = {};

    for (let i = 1; i < lines.length; i++) {
      const [original, descriptive] = lines[i].split(',');
      if (!original || !descriptive) continue;

      const originalTrimmed = original.trim();
      let mapped = descriptive.trim();

      if (seen[mapped]) {
        seen[mapped]++;
        mapped = `${mapped}_${seen[mapped]}`;
      } else {
        seen[mapped] = 1;
      }

      dict[originalTrimmed] = mapped;
    }

    return Object.freeze(dict);
  }
}
