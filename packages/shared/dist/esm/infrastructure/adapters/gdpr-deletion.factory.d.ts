/**
 * GDPR Deletion Factory
 *
 * @remarks
 * Infrastructure Layer: Factory for creating GDPR deletion service.
 * Follows Factory pattern for clean dependency injection.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
import type { IGdprDeletion } from '../ports/i-gdpr-deletion.port';
import type { ClickHouseClient } from '@clickhouse/client';
import { createClickHouseGdprDeletion } from './clickhouse-gdpr-deletion.adapter';
import type { IAuditLogger } from '../ports/i-audit-logger.port';
/**
 * Create GDPR deletion service
 *
 * @param client - ClickHouse client
 * @param auditLogger - Optional audit logger
 * @param config - Optional configuration
 * @returns IGdprDeletion instance with optional audit
 */
export declare function createGdprDeletionService(client: ClickHouseClient, auditLogger?: IAuditLogger, config?: {
    database?: string;
}): IGdprDeletion;
/**
 * Re-export base factory for testing
 */
export { createClickHouseGdprDeletion };
