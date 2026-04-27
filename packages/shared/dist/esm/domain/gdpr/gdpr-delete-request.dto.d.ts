/**
 * GDPR Delete Request DTO
 *
 * @remarks
 * Domain Layer: Data Transfer Object for GDPR deletion requests.
 * Part of GDPR/FZ-152 right-to-delete implementation.
 *
 * Architecture:
 * - Domain Layer: value object with readonly fields
 * - Self-validating on creation
 * - SRP: only represents deletion request
 *
 * Iteration 13: GDPR Right-to-Delete
 */
/**
 * GDPR Delete Request
 *
 * @remarks
 * Value object representing a request to delete all data
 * for a specific organization by INN.
 */
export declare class GdprDeleteRequest {
    readonly inn: string;
    readonly requestedBy: string;
    readonly requestDate: Date;
    private constructor();
    /**
     * Create GDPR delete request with validation
     *
     * @param inn - Organization INN (10 or 12 digits)
     * @param requestedBy - User ID who requested deletion
     * @param requestDate - Request timestamp (defaults to now)
     * @returns GdprDeleteRequest instance
     * @throws Error if validation fails
     */
    static create(inn: string, requestedBy: string, requestDate?: Date): GdprDeleteRequest;
    /**
     * Create request from API params
     *
     * @param params - API parameters
     * @returns GdprDeleteRequest instance
     */
    static fromParams(params: {
        inn: string;
        userId: string;
    }): GdprDeleteRequest;
    /**
     * Convert to plain object
     */
    toObject(): Readonly<{
        inn: string;
        requestedBy: string;
        requestDate: string;
    }>;
    /**
     * Check if request is expired (optional, for future use)
     *
     * @param maxAgeMs - Maximum age in milliseconds
     * @returns true if request age is >= maxAgeMs
     *
     * @remarks
     * A request with maxAgeMs=0 is immediately expired.
     */
    isExpired(maxAgeMs: number): boolean;
}
