"use strict";
/**
 * Audit Event Data Transfer Object
 *
 * @remarks
 * Domain Layer: Represents an audit event for security logging.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Domain Layer: This DTO
 * - Port Layer: IAuditLogger (uses this DTO)
 * - Adapter Layer: Writes audit events to storage
 *
 * Design Decisions:
 * - Immutable: all properties are readonly
 * - Validated: constructor throws for invalid input
 * - Structured: consistent metadata format
 * - Type-safe: enum for event types and actions
 *
 * Use Cases:
 * - Security forensics (who did what)
 * - Compliance (FZ-152, ISO 27001)
 * - Post-incident analysis
 * - Performance monitoring
 *
 * Iteration 12: Audit Logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvent = exports.AuditActionType = exports.AuditEventType = void 0;
const audit_event_validator_1 = require("./audit-event-validator");
/**
 * Audit event types
 *
 * @remarks
 * Categorizes the severity and purpose of audit events.
 */
var AuditEventType;
(function (AuditEventType) {
    /** Security-related event (authentication, authorization) */
    AuditEventType["SECURITY"] = "SECURITY";
    /** Data access event (SELECT queries) */
    AuditEventType["DATA_ACCESS"] = "DATA_ACCESS";
    /** Data modification event (INSERT, UPDATE, DELETE) */
    AuditEventType["DATA_MODIFICATION"] = "DATA_MODIFICATION";
    /** System event (startup, shutdown, config change) */
    AuditEventType["SYSTEM"] = "SYSTEM";
    /** Error event (exceptions, failures) */
    AuditEventType["ERROR"] = "ERROR";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
/**
 * Audit action types
 *
 * @remarks
 * Defines specific actions within audit events.
 * Maps to CRUD operations + system actions.
 */
var AuditActionType;
(function (AuditActionType) {
    /** Read operation */
    AuditActionType["READ"] = "READ";
    /** Create operation */
    AuditActionType["CREATE"] = "CREATE";
    /** Update operation */
    AuditActionType["UPDATE"] = "UPDATE";
    /** Delete operation */
    AuditActionType["DELETE"] = "DELETE";
    /** Bulk operation (batch insert, bulk delete) */
    AuditActionType["BULK"] = "BULK";
    /** Login/authentication */
    AuditActionType["LOGIN"] = "LOGIN";
    /** Logout */
    AuditActionType["LOGOUT"] = "LOGOUT";
    /** Permission change */
    AuditActionType["PERMISSION_CHANGE"] = "PERMISSION_CHANGE";
    /** Configuration change */
    AuditActionType["CONFIG_CHANGE"] = "CONFIG_CHANGE";
})(AuditActionType || (exports.AuditActionType = AuditActionType = {}));
/**
 * Audit Event DTO
 *
 * @remarks
 * Immutable record of a single audit event.
 * Constructor validates all fields and throws for invalid input.
 *
 * @example
 * ```ts
 * const event = new AuditEvent({
 *   eventType: AuditEventType.DATA_MODIFICATION,
 *   actionType: AuditActionType.DELETE,
 *   userId: 'user-123',
 *   resourceType: 'financial_reports',
 *   resourceId: 'inn-1234567890',
 *   metadata: { reason: 'GDPR request', ip: '10.0.0.1' }
 * });
 * ```
 */
class AuditEvent {
    eventType;
    actionType;
    userId;
    resourceType;
    resourceId;
    metadata;
    constructor(
    /** Type of audit event */
    eventType, 
    /** Specific action performed */
    actionType, 
    /** User or service identifier */
    userId, 
    /** Type of resource affected (table name, entity type) */
    resourceType, 
    /** Specific resource identifier (INN, ID, etc.) */
    resourceId, 
    /** Additional context information */
    metadata = {}) {
        this.eventType = eventType;
        this.actionType = actionType;
        this.userId = userId;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.metadata = metadata;
        audit_event_validator_1.auditEventValidator.validate(eventType, actionType, userId, resourceType, resourceId, metadata);
    }
    /**
     * Convert to plain object for storage
     *
     * @remarks
     * Returns a JSON-serializable representation of the event.
     */
    toObject() {
        return {
            eventType: this.eventType,
            actionType: this.actionType,
            userId: this.userId,
            resourceType: this.resourceType,
            resourceId: this.resourceId,
            metadata: this.metadata,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Create AuditEvent from plain object
     *
     * @remarks
     * Factory method for reconstructing events from storage.
     * Timestamp is not stored; it's added by toObject().
     *
     * @param data - Plain object with audit event data
     * @returns Validated AuditEvent instance
     * @throws {Error} If validation fails
     */
    static fromObject(data) {
        const eventType = Object.values(AuditEventType).find(v => v === data.eventType);
        if (!eventType) {
            throw new Error(`Unknown eventType: ${data.eventType}`);
        }
        const actionType = Object.values(AuditActionType).find(v => v === data.actionType);
        if (!actionType) {
            throw new Error(`Unknown actionType: ${data.actionType}`);
        }
        return new AuditEvent(eventType, actionType, data.userId, data.resourceType, data.resourceId, data.metadata || {});
    }
}
exports.AuditEvent = AuditEvent;
