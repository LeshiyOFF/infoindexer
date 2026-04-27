import { SanctionTopic, ALL_SANCTION_TOPICS, isValidSanctionTopic } from './sanction-topic.enum';
import { SanctionLevel, maxSanctionLevel } from './sanction-level.enum';
import {
  SanctionTopicInfo,
  CompanySanctions,
  SanctionCategory
} from './sanction-topic-info.model';
import { SanctionTopicsRegistry } from './sanction-topics-registry';

/**
 * Сервис для работы с санкционными topics
 *
 * Domain Layer: чистая бизнес-логика без зависимостей от инфраструктуры
 *
 * Responsibilities:
 * - Классификация списка topics
 * - Определение уровня риска
 * - Поиск информации по topic
 *
 * Данные о topics хранятся в SanctionTopicsRegistry
 *
 * @implements Single Responsibility Principle
 */
export class SanctionTopicsService {
  private readonly topicInfo: ReadonlyMap<string, SanctionTopicInfo>;

  constructor() {
    this.topicInfo = SanctionTopicsRegistry.getMap();
  }

  /**
   * Классифицирует список topics в структурированную информацию
   *
   * @param topics - массив строк topics из OpenSanctions
   * @returns структурированная информация о санкциях
   */
  classify(topics: readonly string[] = []): CompanySanctions {
    if (topics.length === 0) {
      return this.emptyResult();
    }

    const known: SanctionTopicInfo[] = [];
    const unknown: string[] = [];

    for (const topic of topics) {
      const info = this.topicInfo.get(topic);
      if (info) {
        known.push(info);
      } else if (topic?.trim()) {
        unknown.push(topic);
      }
    }

    if (known.length === 0) {
      return this.emptyResult(unknown);
    }

    const level = this.calculateLevel(known);

    return {
      topics,
      level,
      hasSanctions: level !== SanctionLevel.NONE,
      details: known,
      unknownTopics: unknown
    };
  }

  /**
   * Проверяет является ли topic санкционным
   */
  isSanctionTopic(topic: string): topic is SanctionTopic {
    return isValidSanctionTopic(topic);
  }

  /**
   * Получает информацию по topic
   */
  getInfo(topic: string): SanctionTopicInfo | undefined {
    return this.topicInfo.get(topic);
  }

  /**
   * Получает все topics указанной категории
   */
  getByCategory(category: SanctionCategory): readonly SanctionTopicInfo[] {
    return Array.from(this.topicInfo.values()).filter(info => info.category === category);
  }

  /**
   * Проверяет является ли уровень высоким или средним
   */
  isSignificant(level: SanctionLevel): boolean {
    return level === SanctionLevel.HIGH || level === SanctionLevel.MEDIUM;
  }

  /**
   * Возвращает общее количество известных topics
   */
  getKnownTopicsCount(): number {
    return this.topicInfo.size;
  }

  /**
   * Создаёт пустой результат
   */
  private emptyResult(unknownTopics: readonly string[] = []): CompanySanctions {
    return {
      topics: [],
      level: SanctionLevel.NONE,
      hasSanctions: false,
      details: [],
      unknownTopics
    };
  }

  /**
   * Вычисляет общий уровень риска на основе списка details
   * Возвращает максимальный уровень
   */
  private calculateLevel(details: readonly SanctionTopicInfo[]): SanctionLevel {
    if (details.length === 0) {
      return SanctionLevel.NONE;
    }

    return details.reduce<SanctionLevel>(
      (acc, info) => maxSanctionLevel(acc, info.level),
      SanctionLevel.NONE
    );
  }
}

/**
 * Singleton экземпляр сервиса для использования во всём приложении
 * Соответствует принципу Dependency Inversion - зависимость от абстракции
 */
export const sanctionTopicsService = new SanctionTopicsService();
