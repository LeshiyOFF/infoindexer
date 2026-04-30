/**
 * Infrastructure Adapters Index
 *
 * @remarks
 * Re-exports all infrastructure adapters.
 * Adapters implement ports defined in domain layer.
 */

// Staging & Production adapters
export * from './clickhouse-staging.adapter';
export * from './clickhouse-production.adapter';
export * from './clickhouse-identity-resolver.adapter';

// Monitoring adapters
export * from './memory-monitor-adapter.service';

// Logger adapter (Iteration 4)
export * from './console-logger.adapter';
