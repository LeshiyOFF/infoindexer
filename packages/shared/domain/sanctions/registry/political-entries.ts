import { SanctionTopic } from '../sanction-topic.enum';
import { SanctionLevel } from '../sanction-level.enum';
import { SanctionCategory, createSanctionTopicInfo, SanctionTopicInfo } from '../sanction-topic-info.model';

/**
 * Entries для категории POLITICAL
 * Политические связи и публичные должностные лица
 */
export const politicalEntries: readonly SanctionTopicInfo[] = Object.freeze([
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_PEP,
    label: 'Публичное должностное лицо (PEP)',
    level: SanctionLevel.MEDIUM,
    description: 'Является или являлась публичным должностным лицом согласно FATF',
    category: SanctionCategory.POLITICAL
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_RCA,
    label: 'Близкое лицо PEP',
    level: SanctionLevel.MEDIUM,
    description: 'Близкий родственник или ассоциированное лицо PEP',
    category: SanctionCategory.POLITICAL
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_GOV,
    label: 'Государственный служащий',
    level: SanctionLevel.LOW,
    description: 'Государственный служащий или чиновник',
    category: SanctionCategory.POLITICAL
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_POLITICIAN,
    label: 'Политик',
    level: SanctionLevel.LOW,
    description: 'Политический деятель',
    category: SanctionCategory.POLITICAL
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_DIPLOMAT,
    label: 'Дипломат',
    level: SanctionLevel.LOW,
    description: 'Дипломатический представитель',
    category: SanctionCategory.POLITICAL
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_MILITARY,
    label: 'Военное лицо',
    level: SanctionLevel.MEDIUM,
    description: 'Действующее или бывшее военное лицо',
    category: SanctionCategory.POLITICAL
  }),
  createSanctionTopicInfo({
    topic: SanctionTopic.ROLE_OWNER_STATE,
    label: 'Госсобственность',
    level: SanctionLevel.LOW,
    description: 'Находится в государственной собственности',
    category: SanctionCategory.POLITICAL
  }),
]);
