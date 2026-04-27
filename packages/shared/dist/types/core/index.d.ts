/**
 * Core Module Index
 * Resource-Aware Configuration
 */
export * from './domain';
export * from './infrastructure';
export * from './application';
export { createResourceAwareConfigService } from './application/services/resource-aware-config.factory';
export { ResourceAwareConfigService } from './application/services/resource-aware-config.service';
export type { InitializationResult } from './application/services/resource-aware-config.service';
export type { ResourceAwareConfigServiceOptions } from './application/services/resource-aware-config.factory';
