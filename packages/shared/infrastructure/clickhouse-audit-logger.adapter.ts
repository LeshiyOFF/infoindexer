/**
 * ClickHouse Audit Logger Adapter
 *
 * @remarks
 * Infrastructure Layer: ClickHouse implementation of IAuditLogger.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): IAuditLogger
 * - Adapter (Infrastructure Layer): This class
 *
 * Design Decisions:
 * - Async non-blocking writes
 * - Best-effort delivery (logs to console on failure)
 * - Connection health checking
 * - Statistics tracking for monitoring
 *
 * Error Handling:
 * - Recoverable errors (timeout, connection): log to console, return success: false
 * - Unrecoverable errors (invalid event): throw Error
 *
 * Iteration 12: Audit Logging
 */

import type {
  IAuditLogger,
  AuditLoggerResult,
  AuditLoggerOptions
} from './ports/i-audit-logger.port';
import type { AuditEvent } from '../domain/audit-event.dto';
import type { ClickHouseClient } from '@clickhouse/client';
import { createAuditLogDDL, AUDIT_LOG_DEFAULTS } from './audit-log-sql';
import {
  extractErrorMessage,
  isRecoverableError,
  logToConsole,
  validateAuditLoggerConfig,
  generateLogId
} from './audit-logger.helpers';

/** Default options for ClickHouse audit logger */
const DEFAULT_OPTIONS: Required<AuditLoggerOptions> = {
  sync: false,
  batchSize: 1,
  timeout: 5000
} as const;

/**
 * ClickHouse Audit Logger Adapter
 *
 * @remarks
 * Writes audit events to ClickHouse audit_log table.
 * Falls back to console logging on failure.
 */
export class ClickHouseAuditLoggerAdapter implements IAuditLogger {
  private readonly tableName: string;
  private readonly database: string;
  private readonly options: Required<AuditLoggerOptions>;
  private readonly stats = { logged: 0, failed: 0, pending: 0 };
  private healthy: boolean = true;

  constructor(
    private readonly client: ClickHouseClient,
    config: {
      database?: string;
      tableName?: string;
      options?: AuditLoggerOptions;
    } = {}
  ) {
    this.database = config.database || 'infoindexer';
    this.tableName = config.tableName || AUDIT_LOG_DEFAULTS.tableName;
    this.options = { ...DEFAULT_OPTIONS, ...config.options };
    validateAuditLoggerConfig(this.database, this.tableName);
  }

  async logEvent(event: AuditEvent, options?: AuditLoggerOptions): Promise<AuditLoggerResult> {
    const opts = { ...this.options, ...options };

    try {
      const eventObj = event.toObject();
      const metadataJson = JSON.stringify(eventObj.metadata);

      await this.client.insert({
        table: `${this.database}.${this.tableName}`,
        format: 'JSONEachRow',
        values: [{
          event_type: eventObj.eventType,
          action_type: eventObj.actionType,
          user_id: eventObj.userId,
          resource_type: eventObj.resourceType,
          resource_id: eventObj.resourceId,
          metadata: metadataJson,
          client_ip: eventObj.metadata?.ip || null,
          user_agent: eventObj.metadata?.userAgent || null
        }],
        clickhouse_settings: opts.sync
          ? { wait_for_async_insert: 1 }
          : { async_insert: 1, wait_for_async_insert: 0 }
      });

      this.stats.logged++;
      this.stats.pending--;
      return { success: true, id: generateLogId() };

    } catch (error) {
      this.stats.failed++;
      this.healthy = isRecoverableError(error);
      logToConsole(event, error);
      return { success: false, error: extractErrorMessage(error) };
    }
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  getStats() {
    return { ...this.stats };
  }

  async flush(): Promise<void> {
    // ClickHouse async_insert handles buffering
  }

  async initialize(): Promise<void> {
    try {
      await this.client.command({
        query: createAuditLogDDL(this.database, this.tableName)
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      if (!msg.includes('already exists')) {
        throw error;
      }
    }
  }
}
