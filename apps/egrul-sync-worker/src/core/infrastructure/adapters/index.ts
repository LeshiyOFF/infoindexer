/**
 * Infrastructure Adapters Index
 *
 * @remarks
 * Re-exports all infrastructure adapters.
 * Adapters implement ports defined in domain layer.
 */

// Staging adapters (new)
export * from './clickhouse-staging.adapter';
export * from './clickhouse-identity-resolver.adapter';
