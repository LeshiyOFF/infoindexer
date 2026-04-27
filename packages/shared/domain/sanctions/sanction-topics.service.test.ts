import { describe, it, expect } from 'vitest';
import {
  SanctionTopicsService,
  sanctionTopicsService
} from './sanction-topics.service';
import { SanctionTopic } from './sanction-topic.enum';
import { SanctionLevel } from './sanction-level.enum';
import { SanctionCategory } from './sanction-topic-info.model';

describe('SanctionTopicsService', () => {
  describe('classify', () => {
    it('должен вернуть пустой результат для пустого массива', () => {
      const result = sanctionTopicsService.classify([]);

      expect(result.topics).toEqual([]);
      expect(result.level).toBe(SanctionLevel.NONE);
      expect(result.hasSanctions).toBe(false);
      expect(result.details).toEqual([]);
      expect(result.unknownTopics).toEqual([]);
    });

    it('должен классифицировать прямые санкции как HIGH', () => {
      const result = sanctionTopicsService.classify([SanctionTopic.SANCTION]);

      expect(result.topics).toEqual([SanctionTopic.SANCTION]);
      expect(result.level).toBe(SanctionLevel.HIGH);
      expect(result.hasSanctions).toBe(true);
      expect(result.details).toHaveLength(1);
      expect(result.details[0].label).toBe('Международные санкции');
    });

    it('должен классифицировать PEP как MEDIUM', () => {
      const result = sanctionTopicsService.classify([SanctionTopic.ROLE_PEP]);

      expect(result.level).toBe(SanctionLevel.MEDIUM);
      expect(result.details[0].label).toBe('Публичное должностное лицо (PEP)');
    });

    it('должен классифицировать госслужащего как LOW', () => {
      const result = sanctionTopicsService.classify([SanctionTopic.ROLE_GOV]);

      expect(result.level).toBe(SanctionLevel.LOW);
      expect(result.details[0].label).toBe('Государственный служащий');
    });

    it('должен вернуть максимальный уровень при нескольких topics', () => {
      const result = sanctionTopicsService.classify([
        SanctionTopic.ROLE_GOV,      // LOW
        SanctionTopic.ROLE_PEP,      // MEDIUM
        SanctionTopic.SANCTION       // HIGH
      ]);

      expect(result.level).toBe(SanctionLevel.HIGH);
      expect(result.details).toHaveLength(3);
    });

    it('должен разделить известные и неизвестные topics', () => {
      const result = sanctionTopicsService.classify([
        SanctionTopic.SANCTION,
        'unknown.topic.value'
      ]);

      expect(result.details).toHaveLength(1);
      expect(result.unknownTopics).toEqual(['unknown.topic.value']);
    });

    it('должен игнорировать пустые строки', () => {
      const result = sanctionTopicsService.classify([
        SanctionTopic.SANCTION,
        '',
        '   '
      ]);

      expect(result.details).toHaveLength(1);
      expect(result.unknownTopics).toHaveLength(0);
    });
  });

  describe('isSanctionTopic', () => {
    it('должен распознавать валидные topics', () => {
      expect(sanctionTopicsService.isSanctionTopic(SanctionTopic.SANCTION)).toBe(true);
      expect(sanctionTopicsService.isSanctionTopic(SanctionTopic.ROLE_PEP)).toBe(true);
    });

    it('должен отвергать невалидные topics', () => {
      expect(sanctionTopicsService.isSanctionTopic('invalid.topic')).toBe(false);
      expect(sanctionTopicsService.isSanctionTopic('')).toBe(false);
    });
  });

  describe('getInfo', () => {
    it('должен возвращать информацию для известного topic', () => {
      const info = sanctionTopicsService.getInfo(SanctionTopic.SANCTION);

      expect(info).toBeDefined();
      expect(info?.topic).toBe(SanctionTopic.SANCTION);
      expect(info?.label).toBe('Международные санкции');
      expect(info?.level).toBe(SanctionLevel.HIGH);
      expect(info?.category).toBe(SanctionCategory.SANCTIONS);
      expect(info?.description).toContain('санкциями');
    });

    it('должен возвращать undefined для неизвестного topic', () => {
      const info = sanctionTopicsService.getInfo('unknown.topic');
      expect(info).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('должен возвращать все topics категории SANCTIONS', () => {
      const sanctions = sanctionTopicsService.getByCategory(SanctionCategory.SANCTIONS);

      expect(sanctions.length).toBeGreaterThan(0);
      expect(sanctions.every(s => s.category === SanctionCategory.SANCTIONS)).toBe(true);
    });

    it('должен возвращать все topics категории CRIME', () => {
      const crimes = sanctionTopicsService.getByCategory(SanctionCategory.CRIME);

      expect(crimes.length).toBeGreaterThan(0);
      expect(crimes.every(c => c.category === SanctionCategory.CRIME)).toBe(true);
    });
  });

  describe('isSignificant', () => {
    it('должен считать HIGH значительным', () => {
      expect(sanctionTopicsService.isSignificant(SanctionLevel.HIGH)).toBe(true);
    });

    it('должен считать MEDIUM значительным', () => {
      expect(sanctionTopicsService.isSignificant(SanctionLevel.MEDIUM)).toBe(true);
    });

    it('не должен считать LOW значительным', () => {
      expect(sanctionTopicsService.isSignificant(SanctionLevel.LOW)).toBe(false);
    });

    it('не должен считать NONE значительным', () => {
      expect(sanctionTopicsService.isSignificant(SanctionLevel.NONE)).toBe(false);
    });
  });

  describe('getKnownTopicsCount', () => {
    it('должен возвращать количество известных topics', () => {
      const count = sanctionTopicsService.getKnownTopicsCount();
      expect(count).toBeGreaterThan(20);
    });
  });
});
