"use strict";
/**
 * Domain Layer Index
 *
 * Централизованный экспорт всех Domain Layer компонентов
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditEventValidator = exports.AuditActionType = exports.AuditEventType = exports.AuditEvent = exports.SanctionList = exports.Sanction = exports.SecureUrl = exports.SanctionPeriod = exports.SanctionProgram = exports.Authority = exports.CountryCode = exports.SanctionNotFoundError = exports.EntityParseError = exports.InvalidInnError = exports.InnNotFoundError = exports.UnsafeUrlError = exports.InvalidUrlError = exports.InvalidPeriodError = exports.InvalidSanctionProgramError = exports.InvalidCountryCodeError = exports.DomainError = void 0;
// Base
var domain_error_1 = require("./domain-error");
Object.defineProperty(exports, "DomainError", { enumerable: true, get: function () { return domain_error_1.DomainError; } });
// Errors
var errors_1 = require("./errors");
Object.defineProperty(exports, "InvalidCountryCodeError", { enumerable: true, get: function () { return errors_1.InvalidCountryCodeError; } });
Object.defineProperty(exports, "InvalidSanctionProgramError", { enumerable: true, get: function () { return errors_1.InvalidSanctionProgramError; } });
Object.defineProperty(exports, "InvalidPeriodError", { enumerable: true, get: function () { return errors_1.InvalidPeriodError; } });
Object.defineProperty(exports, "InvalidUrlError", { enumerable: true, get: function () { return errors_1.InvalidUrlError; } });
Object.defineProperty(exports, "UnsafeUrlError", { enumerable: true, get: function () { return errors_1.UnsafeUrlError; } });
Object.defineProperty(exports, "InnNotFoundError", { enumerable: true, get: function () { return errors_1.InnNotFoundError; } });
Object.defineProperty(exports, "InvalidInnError", { enumerable: true, get: function () { return errors_1.InvalidInnError; } });
Object.defineProperty(exports, "EntityParseError", { enumerable: true, get: function () { return errors_1.EntityParseError; } });
Object.defineProperty(exports, "SanctionNotFoundError", { enumerable: true, get: function () { return errors_1.SanctionNotFoundError; } });
// Value Objects
var value_objects_1 = require("./value-objects");
Object.defineProperty(exports, "CountryCode", { enumerable: true, get: function () { return value_objects_1.CountryCode; } });
Object.defineProperty(exports, "Authority", { enumerable: true, get: function () { return value_objects_1.Authority; } });
Object.defineProperty(exports, "SanctionProgram", { enumerable: true, get: function () { return value_objects_1.SanctionProgram; } });
Object.defineProperty(exports, "SanctionPeriod", { enumerable: true, get: function () { return value_objects_1.SanctionPeriod; } });
Object.defineProperty(exports, "SecureUrl", { enumerable: true, get: function () { return value_objects_1.SecureUrl; } });
// Entities
var entities_1 = require("./entities");
Object.defineProperty(exports, "Sanction", { enumerable: true, get: function () { return entities_1.Sanction; } });
Object.defineProperty(exports, "SanctionList", { enumerable: true, get: function () { return entities_1.SanctionList; } });
// Audit Logging (Iteration 12)
var audit_event_dto_1 = require("./audit-event.dto");
Object.defineProperty(exports, "AuditEvent", { enumerable: true, get: function () { return audit_event_dto_1.AuditEvent; } });
Object.defineProperty(exports, "AuditEventType", { enumerable: true, get: function () { return audit_event_dto_1.AuditEventType; } });
Object.defineProperty(exports, "AuditActionType", { enumerable: true, get: function () { return audit_event_dto_1.AuditActionType; } });
var audit_event_validator_1 = require("./audit-event-validator");
Object.defineProperty(exports, "auditEventValidator", { enumerable: true, get: function () { return audit_event_validator_1.auditEventValidator; } });
// Existing sanctions domain (legacy, to be migrated)
__exportStar(require("./sanctions"), exports);
// Rate Limiting (Iteration 14)
__exportStar(require("./rate-limit"), exports);
// Financial Reports (exemption_criteria)
__exportStar(require("./financial-reports"), exports);
// Abort operations
__exportStar(require("./abort/abort-command.dto"), exports);
__exportStar(require("./abort/abort-result.vo"), exports);
// Financial Summary (Iteration 2)
__exportStar(require("./financial-summary"), exports);
