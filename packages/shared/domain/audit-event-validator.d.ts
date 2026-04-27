/**
 * Audit Event Validator
 *
 * @remarks
 * Domain Layer: Validation logic for AuditEvent.
 * Separated from DTO for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
import { AuditEventType, AuditActionType, type AuditMetadata } from './audit-event.dto';
/**
 * Audit Event Validator
 *
 * @remarks
 * Validates all fields of an audit event.
 * Throws Error with descriptive message for invalid input.
 */
export declare class AuditEventValidator {
    /**
     * Validate all audit event fields
     *
     * @throws {Error} If any validation fails
     */
    validate(eventType: AuditEventType, actionType: AuditActionType, userId: string, resourceType: string, resourceId: string | null, metadata: AuditMetadata): void;
    validateEventType(eventType: AuditEventType): void;
    validateActionType(actionType: AuditActionType): void;
    validateUserId(userId: string): void;
    validateResourceType(resourceType: string): void;
    validateResourceId(resourceId: string | null): void;
    validateMetadata(metadata: AuditMetadata): void;
    private validateMetadataKey;
    private validateMetadataValue;
}
/**
 * Singleton validator instance
 */
export declare const auditEventValidator: AuditEventValidator;
