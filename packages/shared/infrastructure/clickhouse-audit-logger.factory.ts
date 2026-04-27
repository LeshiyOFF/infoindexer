/**
 * ClickHouse Audit Logger Factory
 *
 * @remarks
 * Infrastructure Layer: Factory for creating ClickHouse audit logger.
 * Separated from adapter for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type { AuditLoggerOptions } from './ports/i-audit-logger.port';
import { ClickHouseAuditLoggerAdapter } from './clickhouse-audit-logger.adapter';

/**
 * Factory function for creating ClickHouse audit logger
 *
 * @remarks
 * Creates and initializes the audit logger.
 *
 * @param client - ClickHouse client instance
 * @param config - Configuration options
 * @returns Initialized audit logger
 *
 * @example
 * ```ts
 * const logger = await createClickHouseAuditLogger(clickhouseClient, {
 *   database: 'infoindexer'
 * });
 * ```
 */
export async function createClickHouseAuditLogger(
  client: ClickHouseClient,
  config?: {
    database?: string;
    tableName?: string;
    options?: AuditLoggerOptions;
  }
): Promise<ClickHouseAuditLoggerAdapter> {
  const logger = new ClickHouseAuditLoggerAdapter(client, config);
  await logger.initialize();
  return logger;
}
