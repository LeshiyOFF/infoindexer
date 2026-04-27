"use strict";
/**
 * GDPR Deletion Factory
 *
 * @remarks
 * Infrastructure Layer: Factory for creating GDPR deletion service.
 * Follows Factory pattern for clean dependency injection.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClickHouseGdprDeletion = void 0;
exports.createGdprDeletionService = createGdprDeletionService;
const clickhouse_gdpr_deletion_adapter_1 = require("./clickhouse-gdpr-deletion.adapter");
Object.defineProperty(exports, "createClickHouseGdprDeletion", { enumerable: true, get: function () { return clickhouse_gdpr_deletion_adapter_1.createClickHouseGdprDeletion; } });
const audit_event_dto_1 = require("../../domain/audit-event.dto");
/**
 * Audit-enabled GDPR deletion service
 *
 * @remarks
 * Wraps the base adapter with audit logging.
 */
class AuditedGdprDeletionService {
    base;
    auditLogger;
    constructor(base, auditLogger) {
        this.base = base;
        this.auditLogger = auditLogger;
    }
    async confirm(inn) {
        const result = await this.base.confirm(inn);
        if (this.auditLogger) {
            await this.auditLogger.logEvent(new audit_event_dto_1.AuditEvent(audit_event_dto_1.AuditEventType.DATA_ACCESS, audit_event_dto_1.AuditActionType.READ, 'system', 'organization', inn, { action: 'GDPR_CONFIRM', counts: JSON.stringify(result.counts) }));
        }
        return result;
    }
    async execute(request) {
        if (this.auditLogger) {
            await this.auditLogger.logEvent(new audit_event_dto_1.AuditEvent(audit_event_dto_1.AuditEventType.DATA_MODIFICATION, audit_event_dto_1.AuditActionType.DELETE, request.requestedBy, 'organization', request.inn, { action: 'GDPR_DELETE', requestDate: request.requestDate.toISOString() }));
        }
        const result = await this.base.execute(request);
        if (this.auditLogger) {
            const metadata = {
                action: 'GDPR_DELETE_COMPLETE',
                success: result.success.toString(),
                deletedCount: result.counts.total.toString()
            };
            if (result.errors.length > 0) {
                metadata.errors = JSON.stringify(result.errors);
            }
            await this.auditLogger.logEvent(new audit_event_dto_1.AuditEvent(result.success ? audit_event_dto_1.AuditEventType.DATA_MODIFICATION : audit_event_dto_1.AuditEventType.ERROR, audit_event_dto_1.AuditActionType.DELETE, request.requestedBy, 'organization', request.inn, metadata));
        }
        return result;
    }
    isHealthy() {
        return this.base.isHealthy?.() ?? true;
    }
}
/**
 * Create GDPR deletion service
 *
 * @param client - ClickHouse client
 * @param auditLogger - Optional audit logger
 * @param config - Optional configuration
 * @returns IGdprDeletion instance with optional audit
 */
function createGdprDeletionService(client, auditLogger, config) {
    const base = (0, clickhouse_gdpr_deletion_adapter_1.createClickHouseGdprDeletion)(client, config);
    return auditLogger ? new AuditedGdprDeletionService(base, auditLogger) : base;
}
