/**
 * GDPR Domain Layer Exports
 *
 * @remarks
 * Domain Layer: Public API for GDPR deletion.
 * Part of GDPR/FZ-152 right-to-delete implementation.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
// Validator
export { InnValidator, innValidator } from './inn.validator';
// DTOs
export { GdprDeleteRequest } from './gdpr-delete-request.dto';
export { GdprDeleteResult } from './gdpr-delete-result.dto';
export { createDeletionCounts } from './gdpr-delete-result.dto';
