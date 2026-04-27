/**
 * Domain Ports Index
 *
 * @remarks
 * Re-exports all domain ports.
 * Ports define contracts for infrastructure adapters.
 */

// Existing ports (re-exported from core/ports)
export * from '../../ports/i-mv-insert.port';
export * from '../../ports/i-direct-insert.port';
export * from '../../ports/i-sync-state-storage.port';
export * from '../../ports/i-resume-state-storage.port';
export * from '../../ports/i-circuit-breaker-manager.port';

// New staging ports
export * from './i-staging-storage.port';
export * from './i-identity-resolver.port';
