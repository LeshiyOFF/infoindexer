import { SanctionTopic } from '../sanction-topic.enum';
import { SanctionLevel } from '../sanction-level.enum';
import { SanctionCategory, createSanctionTopicInfo, SanctionTopicInfo } from '../sanction-topic-info.model';

/**
 * Entries для категории CRIME
 * Различные виды преступной деятельности
 */
export const crimeEntries: readonly SanctionTopicInfo[] = Object.freeze([
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_FRAUD,
    label: 'Мошенничество',
    level: SanctionLevel.HIGH,
    description: 'Связь с мошенническими схемами',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_CORRUPTION,
    label: 'Коррупция',
    level: SanctionLevel.HIGH,
    description: 'Связь с коррупционными схемами',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_MONEY_LAUNDERING,
    label: 'Отмывание денег',
    level: SanctionLevel.HIGH,
    description: 'Связь с отмыванием денежных средств',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_TAX_FRAUD,
    label: 'Налоговые нарушения',
    level: SanctionLevel.MEDIUM,
    description: 'Налоговые мошенничество или уклонение',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_CYBER,
    label: 'Киберпреступность',
    level: SanctionLevel.HIGH,
    description: 'Связь с киберпреступной деятельностью',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_TERROR,
    label: 'Терроризм',
    level: SanctionLevel.HIGH,
    description: 'Связь с террористической деятельностью',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_HUMAN,
    label: 'Торговля людьми',
    level: SanctionLevel.HIGH,
    description: 'Связь с торговлей людьми',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_DRUGS,
    label: 'Наркотики',
    level: SanctionLevel.HIGH,
    description: 'Связь с наркотрафиком',
    category: SanctionCategory.CRIME
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.CRIME_ORGANIZED,
    label: 'Организованная преступность',
    level: SanctionLevel.HIGH,
    description: 'Связь с организованными преступными группами',
    category: SanctionCategory.CRIME
  }),
]);
