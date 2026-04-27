/**
 * Financial Summary Domain Layer Index
 *
 * @remarks
 * Domain Layer: Value Objects для финансовой сводки организации.
 * Part of Clean Architecture / Hexagonal Ports & Adapters.
 *
 * Architecture:
 * - Domain Layer: Value Objects (иммутабельные, валидируемые)
 * - Infrastructure Layer: адаптеры маппят данные из ClickHouse в эти VOs
 * - No dependencies on ClickHouse, HTTP, or other infrastructure
 *
 * Iteration 2: Domain Layer (VOs + DTOs)
 */

// Value Objects
export { Money } from './money.vo';
export { FinancialSummary } from './financial-summary.vo';

// Data Transfer Objects
export type {
  MoneyData,
  MoneyDTO,
  FinancialSummaryData,
  FinancialSummaryDTO
} from './financial-summary-data.dto';

// Errors
export {
  InvalidMoneyError,
  FinancialSummaryNotFoundError,
  FinancialSummaryValidationError
} from './financial-summary-error';
export type {
  InvalidMoneyErrorContext,
  FinancialSummaryNotFoundErrorContext,
  FinancialSummaryValidationErrorContext
} from './financial-summary-error';
