import { SanctionTopic } from '../sanction-topic.enum';
import { SanctionLevel } from '../sanction-level.enum';
import { SanctionCategory, createSanctionTopicInfo, SanctionTopicInfo } from '../sanction-topic-info.model';

/**
 * Entries для категории SANCTIONS
 * Международные санкции различных регуляторов
 */
export const sanctionsEntries: readonly SanctionTopicInfo[] = Object.freeze([
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION,
    label: 'Международные санкции',
    level: SanctionLevel.HIGH,
    description: 'Компания находится под санкциями EU, US, UN или других регуляторов',
    category: SanctionCategory.SANCTIONS
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION_LINKED,
    label: 'Связь с санкционными лицами',
    level: SanctionLevel.HIGH,
    description: 'Компания связана с лицами под санкциями',
    category: SanctionCategory.SANCTIONS
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION_US_OFAC,
    label: 'Санкции OFAC (США)',
    level: SanctionLevel.HIGH,
    description: 'В санкционном списке OFAC Министерства финансов США',
    category: SanctionCategory.SANCTIONS
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION_EU,
    label: 'Санкции ЕС',
    level: SanctionLevel.HIGH,
    description: 'В санкционном списке Европейского союза',
    category: SanctionCategory.SANCTIONS
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION_UK,
    label: 'Санкции Великобритании',
    level: SanctionLevel.HIGH,
    description: 'В санкционном списке Великобритании',
    category: SanctionCategory.SANCTIONS
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION_UN,
    label: 'Санкции ООН',
    level: SanctionLevel.HIGH,
    description: 'В санкционном списке ООН',
    category: SanctionCategory.SANCTIONS
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.SANCTION_SEC,
    label: 'Секторальные санкции',
    level: SanctionLevel.HIGH,
    description: 'Попадает под секторальные санкции',
    category: SanctionCategory.SANCTIONS
  }),
]);
