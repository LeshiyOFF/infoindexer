/**
 * Audit Event Validator
 *
 * @remarks
 * Domain Layer: Validation logic for AuditEvent.
 * Separated from DTO for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
import { AuditEventType, AuditActionType } from './audit-event.dto';
/**
 * Validation patterns
 */
const PATTERNS = {
    USER_ID: /^[a-zA-Z0-9_\-@.]{1,100}$/,
    RESOURCE_TYPE: /^[a-z_]{1,50}$/
};
/**
 * Size limits
 */
const LIMITS = {
    MAX_METADATA_SIZE: 1000,
    MAX_RESOURCE_ID_LENGTH: 200
};
/**
 * Audit Event Validator
 *
 * @remarks
 * Validates all fields of an audit event.
 * Throws Error with descriptive message for invalid input.
 */
export class AuditEventValidator {
    /**
     * Validate all audit event fields
     *
     * @throws {Error} If any validation fails
     */
    validate(eventType, actionType, userId, resourceType, resourceId, metadata) {
        this.validateEventType(eventType);
        this.validateActionType(actionType);
        this.validateUserId(userId);
        this.validateResourceType(resourceType);
        this.validateResourceId(resourceId);
        this.validateMetadata(metadata);
    }
    validateEventType(eventType) {
        if (!Object.values(AuditEventType).includes(eventType)) {
            throw new Error(`Invalid eventType: ${eventType}`);
        }
    }
    validateActionType(actionType) {
        if (!Object.values(AuditActionType).includes(actionType)) {
            throw new Error(`Invalid actionType: ${actionType}`);
        }
    }
    validateUserId(userId) {
        if (!userId || typeof userId !== 'string') {
            throw new Error('userId must be a non-empty string');
        }
        if (!PATTERNS.USER_ID.test(userId)) {
            throw new Error(`Invalid userId format: ${userId}`);
        }
    }
    validateResourceType(resourceType) {
        if (!resourceType || typeof resourceType !== 'string') {
            throw new Error('resourceType must be a non-empty string');
        }
        if (!PATTERNS.RESOURCE_TYPE.test(resourceType)) {
            throw new Error(`Invalid resourceType format: ${resourceType}`);
        }
    }
    validateResourceId(resourceId) {
        if (resourceId !== null) {
            if (typeof resourceId !== 'string') {
                throw new Error('resourceId must be a string or null');
            }
            if (resourceId.length > LIMITS.MAX_RESOURCE_ID_LENGTH) {
                throw new Error(`resourceId exceeds max length of ${LIMITS.MAX_RESOURCE_ID_LENGTH}`);
            }
        }
    }
    validateMetadata(metadata) {
        if (typeof metadata !== 'object' || metadata === null) {
            throw new Error('metadata must be an object');
        }
        const metadataStr = JSON.stringify(metadata);
        if (metadataStr.length > LIMITS.MAX_METADATA_SIZE) {
            throw new Error(`metadata exceeds max size of ${LIMITS.MAX_METADATA_SIZE} bytes`);
        }
        for (const [key, value] of Object.entries(metadata)) {
            this.validateMetadataKey(key);
            this.validateMetadataValue(key, value);
        }
    }
    validateMetadataKey(key) {
        if (typeof key !== 'string' || key.length === 0) {
            throw new Error('metadata keys must be non-empty strings');
        }
    }
    validateMetadataValue(key, value) {
        const allowedTypes = ['string', 'number', 'boolean'];
        if (!allowedTypes.includes(typeof value)) {
            throw new Error(`metadata value for key "${key}" must be string, number, or boolean`);
        }
    }
}
/**
 * Singleton validator instance
 */
export const auditEventValidator = new AuditEventValidator();
