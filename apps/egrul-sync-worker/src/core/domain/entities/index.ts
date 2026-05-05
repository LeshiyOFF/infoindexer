/**
 * Domain Entities Index
 *
 * @remarks
 * Re-exports all domain entities for MV + Staging approach.
 */

// Production entities (MV-backed)
export * from './egrul-director.entity';
export * from './egrul-founder.entity';

// Staging entities (raw FTM data)
export * from './staging-company.entity';
export * from './staging-directorship.entity';
export * from './staging-ownership.entity';
export * from './staging-entity.entity';

// Core entities (re-exported for compatibility)
export { EgrulCompanyRow } from '../../entities/egrul-company.interface';
