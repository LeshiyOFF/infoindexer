"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingTransformResult = void 0;
/**
 * Staging Transform Result Value Object
 *
 * @remarks
 * Immutable result of staging transformation operation.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * Provides success/failure status and detailed metrics.
 */
class StagingTransformResult {
    directorsProcessed;
    foundersProcessed;
    internalErrors;
    durationMs;
    constructor(directorsProcessed, foundersProcessed, internalErrors, durationMs) {
        this.directorsProcessed = directorsProcessed;
        this.foundersProcessed = foundersProcessed;
        this.internalErrors = internalErrors;
        this.durationMs = durationMs;
    }
    /**
     * Creates a new StagingTransformResult
     *
     * @param directorsProcessed - Number of director records transformed
     * @param foundersProcessed - Number of founder records transformed
     * @param errors - Array of errors encountered during transformation
     * @param durationMs - Total duration in milliseconds
     * @returns Immutable result instance
     */
    static create(directorsProcessed, foundersProcessed, errors, durationMs) {
        return new StagingTransformResult(directorsProcessed, foundersProcessed, Object.freeze(errors), durationMs);
    }
    /**
     * Creates a successful result
     */
    static success(directorsProcessed, foundersProcessed, durationMs) {
        return StagingTransformResult.create(directorsProcessed, foundersProcessed, [], durationMs);
    }
    /**
     * Creates a failed result
     */
    static failure(directorsProcessed, foundersProcessed, error, durationMs) {
        return StagingTransformResult.create(directorsProcessed, foundersProcessed, [error], durationMs);
    }
    /**
     * Checks if transformation completed without errors
     */
    get success() {
        return this.internalErrors.length === 0;
    }
    /**
     * Checks if errors occurred during transformation
     */
    get hasErrors() {
        return this.internalErrors.length > 0;
    }
    /**
     * Returns error count
     */
    get errorCount() {
        return this.internalErrors.length;
    }
    /**
     * Returns readonly array of errors
     */
    get errors() {
        return this.internalErrors;
    }
    /**
     * Returns total records processed
     */
    get totalProcessed() {
        return this.directorsProcessed + this.foundersProcessed;
    }
}
exports.StagingTransformResult = StagingTransformResult;
