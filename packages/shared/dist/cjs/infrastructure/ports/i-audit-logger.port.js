"use strict";
/**
 * Audit Logger Port
 *
 * @remarks
 * Domain Layer: Defines the contract for audit logging.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): This interface
 * - Adapter (Infrastructure Layer): ClickHouseAuditLoggerAdapter, ConsoleAuditLoggerAdapter
 *
 * Design Decision: Minimal interface
 * - Single method: logEvent() for all audit operations
 * - Async: supports remote storage (ClickHouse, S3, etc.)
 * - Error handling: throws for unrecoverable errors, logs for recoverable
 *
 * Implementations:
 * - ClickHouseAuditLoggerAdapter: Writes to audit_log table (Iteration 12)
 * - ConsoleAuditLoggerAdapter: Console output for development (Iteration 12)
 * - S3AuditLoggerAdapter: Writes to S3 for long-term storage (future)
 * - ElasticsearchAuditLoggerAdapter: Writes to Elasticsearch for search (future)
 *
 * Iteration 12: Audit Logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
