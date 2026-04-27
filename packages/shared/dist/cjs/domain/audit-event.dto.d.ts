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
/**
 * Audit event types
 *
 * @remarks
 * Categorizes the severity and purpose of audit events.
 */
export declare enum AuditEventType {
    /** Security-related event (authentication, authorization) */
    SECURITY = "SECURITY",
    /** Data access event (SELECT queries) */
    DATA_ACCESS = "DATA_ACCESS",
    /** Data modification event (INSERT, UPDATE, DELETE) */
    DATA_MODIFICATION = "DATA_MODIFICATION",
    /** System event (startup, shutdown, config change) */
    SYSTEM = "SYSTEM",
    /** Error event (exceptions, failures) */
    ERROR = "ERROR"
}
/**
 * Audit action types
 *
 * @remarks
 * Defines specific actions within audit events.
 * Maps to CRUD operations + system actions.
 */
export declare enum AuditActionType {
    /** Read operation */
    READ = "READ",
    /** Create operation */
    CREATE = "CREATE",
    /** Update operation */
    UPDATE = "UPDATE",
    /** Delete operation */
    DELETE = "DELETE",
    /** Bulk operation (batch insert, bulk delete) */
    BULK = "BULK",
    /** Login/authentication */
    LOGIN = "LOGIN",
    /** Logout */
    LOGOUT = "LOGOUT",
    /** Permission change */
    PERMISSION_CHANGE = "PERMISSION_CHANGE",
    /** Configuration change */
    CONFIG_CHANGE = "CONFIG_CHANGE"
}
/**
 * Audit event metadata
 *
 * @remarks
 * Structured key-value storage for additional context.
 * All values must be JSON-serializable.
 */
export type AuditMetadata = Readonly<Record<string, string | number | boolean | null>>;
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
export declare class AuditEvent {
    /** Type of audit event */
    readonly eventType: AuditEventType;
    /** Specific action performed */
    readonly actionType: AuditActionType;
    /** User or service identifier */
    readonly userId: string;
    /** Type of resource affected (table name, entity type) */
    readonly resourceType: string;
    /** Specific resource identifier (INN, ID, etc.) */
    readonly resourceId: string | null;
    /** Additional context information */
    readonly metadata: AuditMetadata;
    constructor(
    /** Type of audit event */
    eventType: AuditEventType, 
    /** Specific action performed */
    actionType: AuditActionType, 
    /** User or service identifier */
    userId: string, 
    /** Type of resource affected (table name, entity type) */
    resourceType: string, 
    /** Specific resource identifier (INN, ID, etc.) */
    resourceId: string | null, 
    /** Additional context information */
    metadata?: AuditMetadata);
    /**
     * Convert to plain object for storage
     *
     * @remarks
     * Returns a JSON-serializable representation of the event.
     */
    toObject(): Readonly<{
        eventType: string;
        actionType: string;
        userId: string;
        resourceType: string;
        resourceId: string | null;
        metadata: AuditMetadata;
        timestamp: string;
    }>;
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
    static fromObject(data: {
        eventType: string;
        actionType: string;
        userId: string;
        resourceType: string;
        resourceId: string | null;
        metadata?: AuditMetadata;
    }): AuditEvent;
}
