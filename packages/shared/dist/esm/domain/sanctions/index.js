/**
 * Domain Layer: Санкции и рисковые метки
 *
 * Экспортирует всё необходимое для работы с санкционными topics из OpenSanctions
 */
// Enums
export * from './sanction-topic.enum';
export * from './sanction-level.enum';
// Values
export { SanctionCategory, createSanctionTopicInfo } from './sanction-topic-info.model';
// Registry
export { SanctionTopicsRegistry } from './sanction-topics-registry';
// Service
export { SanctionTopicsService, sanctionTopicsService } from './sanction-topics.service';
