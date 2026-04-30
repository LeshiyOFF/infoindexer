import { SanctionTopic } from '../sanction-topic.enum';
import { SanctionLevel } from '../sanction-level.enum';
import { SanctionCategory, createSanctionTopicInfo } from '../sanction-topic-info.model';
/**
 * Entries для категории FINANCING
 * Финансирование запрещённых деятельностей
 */
export const financingEntries = Object.freeze([
    createSanctionTopicInfo({
        topic: SanctionTopic.FINANCING_FIRED,
        label: 'Запрещённое финансирование',
        level: SanctionLevel.MEDIUM,
        description: 'Финансирование запрещённых видов деятельности',
        category: SanctionCategory.FINANCING
    }),
    createSanctionTopicInfo({
        topic: SanctionTopic.FINANCING_TERROR,
        label: 'Финансирование терроризма',
        level: SanctionLevel.HIGH,
        description: 'Связь с финансированием террористической деятельности',
        category: SanctionCategory.FINANCING
    }),
]);
