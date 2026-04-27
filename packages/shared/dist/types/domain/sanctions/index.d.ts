/**
 * Domain Layer: Санкции и рисковые метки
 *
 * Экспортирует всё необходимое для работы с санкционными topics из OpenSanctions
 */
export * from './sanction-topic.enum';
export * from './sanction-level.enum';
export type { SanctionTopicInfo, CompanySanctions, SanctionTopicInfoParams } from './sanction-topic-info.model';
export { SanctionCategory, createSanctionTopicInfo } from './sanction-topic-info.model';
export { SanctionTopicsRegistry } from './sanction-topics-registry';
export { SanctionTopicsService, sanctionTopicsService } from './sanction-topics.service';
