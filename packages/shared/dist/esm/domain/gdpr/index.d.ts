/**
 * GDPR Domain Layer Exports
 *
 * @remarks
 * Domain Layer: Public API for GDPR deletion.
 * Part of GDPR/FZ-152 right-to-delete implementation.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
export { InnValidator, innValidator } from './inn.validator';
export type { ValidationResult } from './inn.validator';
export { GdprDeleteRequest } from './gdpr-delete-request.dto';
export { GdprDeleteResult } from './gdpr-delete-result.dto';
export type { DeletionCounts, TableError } from './gdpr-delete-result.dto';
export { createDeletionCounts } from './gdpr-delete-result.dto';
