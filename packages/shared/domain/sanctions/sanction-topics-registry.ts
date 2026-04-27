import { SanctionTopic } from './sanction-topic.enum';
import { SanctionLevel } from './sanction-level.enum';
import { SanctionCategory, createSanctionTopicInfo, SanctionTopicInfo } from './sanction-topic-info.model';
import { sanctionsEntries } from './registry/sanctions-entries';
import { politicalEntries } from './registry/political-entries';
import { crimeEntries } from './registry/crime-entries';
import { financingEntries } from './registry/financing-entries';
import { specialEntries } from './registry/special-entries';

/**
 * Реестр маппинга topics → метаданные
 *
 * Вынесен в отдельный файл для соответствия правилу <200 строк
 * Содержит только данные без бизнес-логики
 *
 * @implements Single Responsibility Principle
 */
export class SanctionTopicsRegistry {
  private static readonly entries: readonly SanctionTopicInfo[] = Object.freeze([
    ...sanctionsEntries,
    ...politicalEntries,
    ...crimeEntries,
    ...financingEntries,
    ...specialEntries,
  ]);

  /**
   * Возвращает Map для быстрого поиска topic → info
   */
  static getMap(): ReadonlyMap<string, SanctionTopicInfo> {
    const map = new Map<string, SanctionTopicInfo>();
    for (const entry of SanctionTopicsRegistry.entries) {
      map.set(entry.topic, entry);
    }
    return map;
  }

  /**
   * Возвращает все entries
   */
  static getAll(): readonly SanctionTopicInfo[] {
    return SanctionTopicsRegistry.entries;
  }

  /**
   * Возвращает количество известных topics
   */
  static getCount(): number {
    return SanctionTopicsRegistry.entries.length;
  }
}
