"use strict";
/**
 * INN Validator for GDPR Deletion
 *
 * @remarks
 * Domain Layer: Validates Russian INN (Taxpayer Identification Number).
 * Part of GDPR/FZ-152 right-to-delete implementation.
 *
 * Requirements:
 * - ФЗ-152 requires INN to be exactly 10 or 12 digits
 * - 10 digits: legal entities
 * - 12 digits: individual entrepreneurs
 *
 * Architecture:
 * - Domain Layer: pure validation logic
 * - No external dependencies
 * - SRP: only validates INN format
 *
 * Iteration 13: GDPR Right-to-Delete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.innValidator = exports.InnValidator = void 0;
const invalid_inn_error_1 = require("../errors/invalid-inn-error");
/**
 * INN Validator
 *
 * @remarks
 * Validates INN format according to FZ-152 requirements.
 * Uses regex pattern matching.
 */
class InnValidator {
    static INN_10_PATTERN = /^\d{10}$/;
    static INN_12_PATTERN = /^\d{12}$/;
    static LEGAL_ENTITY_LENGTH = 10;
    static INDIVIDUAL_LENGTH = 12;
    /**
     * Validate INN format
     *
     * @param inn - INN string to validate
     * @returns ValidationResult with isValid flag and optional error
     *
     * @remarks
     * FZ-152 requires INN to be exactly 10 or 12 digits.
     * Legal entities: 10 digits, Individual entrepreneurs: 12 digits.
     */
    validate(inn) {
        if (!inn || typeof inn !== 'string') {
            return {
                isValid: false,
                error: new invalid_inn_error_1.InvalidInnError('INN is required and must be a string', { inn })
            };
        }
        const trimmed = inn.trim();
        // Must be exactly 10 or 12 digits, not 11
        const isValid10 = InnValidator.INN_10_PATTERN.test(trimmed);
        const isValid12 = InnValidator.INN_12_PATTERN.test(trimmed);
        if (!isValid10 && !isValid12) {
            return {
                isValid: false,
                error: new invalid_inn_error_1.InvalidInnError(`INN must be exactly ${InnValidator.LEGAL_ENTITY_LENGTH} or ${InnValidator.INDIVIDUAL_LENGTH} digits`, { inn: trimmed })
            };
        }
        return { isValid: true };
    }
    /**
     * Validate and throw if invalid
     *
     * @param inn - INN string to validate
     * @throws InvalidInnError if validation fails
     */
    validateOrThrow(inn) {
        const result = this.validate(inn);
        if (!result.isValid) {
            throw result.error;
        }
    }
}
exports.InnValidator = InnValidator;
/**
 * Singleton instance
 */
exports.innValidator = new InnValidator();
