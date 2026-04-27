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
import { InvalidInnError } from '../errors/invalid-inn-error';
/**
 * Validation result
 */
export interface ValidationResult {
    readonly isValid: boolean;
    readonly error?: InvalidInnError;
}
/**
 * INN Validator
 *
 * @remarks
 * Validates INN format according to FZ-152 requirements.
 * Uses regex pattern matching.
 */
export declare class InnValidator {
    private static readonly INN_10_PATTERN;
    private static readonly INN_12_PATTERN;
    private static readonly LEGAL_ENTITY_LENGTH;
    private static readonly INDIVIDUAL_LENGTH;
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
    validate(inn: string): ValidationResult;
    /**
     * Validate and throw if invalid
     *
     * @param inn - INN string to validate
     * @throws InvalidInnError if validation fails
     */
    validateOrThrow(inn: string): void;
}
/**
 * Singleton instance
 */
export declare const innValidator: InnValidator;
