import { SanctionTopic } from '../sanction-topic.enum';
import { SanctionLevel } from '../sanction-level.enum';
import { SanctionCategory, createSanctionTopicInfo } from '../sanction-topic-info.model';
/**
 * Entries для категории SPECIAL
 * Специальные метки и флаги
 */
export const specialEntries = Object.freeze([
    createSanctionTopicInfo({
        topic: SanctionTopic.SPECIAL_CONSCRIPT,
        label: 'Мобилизация / принудительная служба',
        level: SanctionLevel.LOW,
        description: 'Мобилизованное или принудительнослужащее лицо',
        category: SanctionCategory.SPECIAL
    }),
    createSanctionTopicInfo({
        topic: SanctionTopic.SPECIAL_FACILITATOR,
        label: 'Посредник',
        level: SanctionLevel.MEDIUM,
        description: 'Действует как посредник в сделках',
        category: SanctionCategory.SPECIAL
    }),
    createSanctionTopicInfo({
        topic: SanctionTopic.SPECIAL_INACTIVE,
        label: 'Неактивная запись',
        level: SanctionLevel.LOW,
        description: 'Запись неактивна или устарела',
        category: SanctionCategory.SPECIAL
    }),
]);
