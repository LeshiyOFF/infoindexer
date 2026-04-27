/**
 * Audit Logger Factory
 *
 * @remarks
 * Infrastructure Layer: Factory for creating IAuditLogger instances.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Domain Layer: IAuditLogger Port
 * - Infrastructure Layer: This factory + adapters
 *
 * Design Decisions:
 * - Factory pattern for consistent creation
 * - Environment-based adapter selection
 * - Fallback to console on errors
 * - Singleton-like behavior (one instance per config)
 *
 * Iteration 12: Audit Logging
 */

import type { IAuditLogger, AuditLoggerOptions } from './ports/i-audit-logger.port';
import type { ClickHouseClient } from '@clickhouse/client';
import { createClickHouseAuditLogger } from './clickhouse-audit-logger.factory';
import { createConsoleAuditLogger } from './console-audit-logger.adapter';

/**
 * Audit logger type
 *
 * @remarks
 * Determines which adapter to use.
 */
export enum AuditLoggerType {
  /** ClickHouse adapter (production) */
  CLICKHOUSE = 'clickhouse',
  /** Console adapter (development) */
  CONSOLE = 'console',
  /** Auto-select based on NODE_ENV */
  AUTO = 'auto'
}

/**
 * Audit logger factory options
 *
 * @remarks
 * Configuration for logger creation.
 */
export interface AuditLoggerFactoryOptions {
  /** Logger type (default: AUTO) */
  type?: AuditLoggerType;
  /** Database name (ClickHouse only) */
  database?: string;
  /** Table name (ClickHouse only) */
  tableName?: string;
  /** Enable console debug mode */
  consoleDebug?: boolean;
  /** Enable console colors */
  consoleColors?: boolean;
  /** Audit logger options */
  loggerOptions?: AuditLoggerOptions;
}

/**
 * Create an audit logger based on configuration
 *
 * @remarks
 * - AUTO: ClickHouse in production, console otherwise
 * - CLICKHOUSE: Always ClickHouse
 * - CONSOLE: Always console
 *
 * @param client - ClickHouse client (required for ClickHouse type)
 * @param options - Factory configuration
 * @returns Configured audit logger
 *
 * @throws {Error} If ClickHouse type requested but client not provided
 *
 * @example
 * ```ts
 * // Production with ClickHouse
 * const logger = await createAuditLogger(clickhouseClient, {
 *   type: AuditLoggerType.CLICKHOUSE,
 *   database: 'infoindexer'
 * });
 *
 * // Development with console
 * const logger = createAuditLogger(undefined, {
 *   type: AuditLoggerType.CONSOLE,
 *   consoleDebug: true
 * });
 *
 * // Auto-select
 * const logger = await createAuditLogger(clickhouseClient, {
 *   type: AuditLoggerType.AUTO  // ClickHouse in prod, console in dev
 * });
 * ```
 */
export async function createAuditLogger(
  client: ClickHouseClient | undefined,
  options: AuditLoggerFactoryOptions = {}
): Promise<IAuditLogger> {
  const type = options.type ?? AuditLoggerType.AUTO;
  const effectiveType = type === AuditLoggerType.AUTO
    ? selectAutoType()
    : type;

  switch (effectiveType) {
    case AuditLoggerType.CLICKHOUSE:
      return await createClickHouseLogger(client, options);

    case AuditLoggerType.CONSOLE:
      return createConsoleLogger(options);

    default:
      return createConsoleLogger(options);
  }
}

/**
 * Create ClickHouse audit logger
 *
 * @remarks
 * Initializes the audit log table if needed.
 */
async function createClickHouseLogger(
  client: ClickHouseClient | undefined,
  options: AuditLoggerFactoryOptions
): Promise<IAuditLogger> {
  if (!client) {
    throw new Error(
      'ClickHouse client is required for CLICKHOUSE audit logger type. ' +
      'Provide a client or use CONSOLE type.'
    );
  }

  return await createClickHouseAuditLogger(client, {
    database: options.database,
    tableName: options.tableName,
    options: options.loggerOptions
  });
}

/**
 * Create console audit logger
 */
function createConsoleLogger(
  options: AuditLoggerFactoryOptions
): IAuditLogger {
  return createConsoleAuditLogger({
    debug: options.consoleDebug,
    colors: options.consoleColors
  });
}

/**
 * Select logger type based on environment
 *
 * @remarks
 * - Production: ClickHouse
 * - Development/Test: Console
 */
function selectAutoType(): AuditLoggerType {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase() ?? 'development';

  if (nodeEnv === 'production' || nodeEnv === 'prod') {
    return AuditLoggerType.CLICKHOUSE;
  }

  return AuditLoggerType.CONSOLE;
}

// Re-export for direct access
export { createClickHouseAuditLogger } from './clickhouse-audit-logger.factory';
export { ClickHouseAuditLoggerAdapter } from './clickhouse-audit-logger.adapter';
export { ConsoleAuditLoggerAdapter, createConsoleAuditLogger } from './console-audit-logger.adapter';
