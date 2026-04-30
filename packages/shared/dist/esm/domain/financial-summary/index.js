"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialSummaryValidationError = exports.FinancialSummaryNotFoundError = exports.InvalidMoneyError = exports.FinancialSummary = exports.Money = void 0;
// Value Objects
var money_vo_1 = require("./money.vo");
Object.defineProperty(exports, "Money", { enumerable: true, get: function () { return money_vo_1.Money; } });
var financial_summary_vo_1 = require("./financial-summary.vo");
Object.defineProperty(exports, "FinancialSummary", { enumerable: true, get: function () { return financial_summary_vo_1.FinancialSummary; } });
// Errors
var financial_summary_error_1 = require("./financial-summary-error");
Object.defineProperty(exports, "InvalidMoneyError", { enumerable: true, get: function () { return financial_summary_error_1.InvalidMoneyError; } });
Object.defineProperty(exports, "FinancialSummaryNotFoundError", { enumerable: true, get: function () { return financial_summary_error_1.FinancialSummaryNotFoundError; } });
Object.defineProperty(exports, "FinancialSummaryValidationError", { enumerable: true, get: function () { return financial_summary_error_1.FinancialSummaryValidationError; } });
