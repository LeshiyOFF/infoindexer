"use strict";
/**
 * Domain Errors Index
 *
 * Централизованный экспорт всех domain ошибок
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionNotFoundError = exports.EntityParseError = exports.InvalidInnError = exports.InnNotFoundError = exports.UnsafeUrlError = exports.InvalidUrlError = exports.InvalidPeriodError = exports.InvalidSanctionProgramError = exports.InvalidCountryCodeError = exports.DomainError = void 0;
var domain_error_1 = require("../domain-error");
Object.defineProperty(exports, "DomainError", { enumerable: true, get: function () { return domain_error_1.DomainError; } });
var invalid_country_code_error_1 = require("./invalid-country-code-error");
Object.defineProperty(exports, "InvalidCountryCodeError", { enumerable: true, get: function () { return invalid_country_code_error_1.InvalidCountryCodeError; } });
var invalid_sanction_program_error_1 = require("./invalid-sanction-program-error");
Object.defineProperty(exports, "InvalidSanctionProgramError", { enumerable: true, get: function () { return invalid_sanction_program_error_1.InvalidSanctionProgramError; } });
var invalid_period_error_1 = require("./invalid-period-error");
Object.defineProperty(exports, "InvalidPeriodError", { enumerable: true, get: function () { return invalid_period_error_1.InvalidPeriodError; } });
var invalid_url_error_1 = require("./invalid-url-error");
Object.defineProperty(exports, "InvalidUrlError", { enumerable: true, get: function () { return invalid_url_error_1.InvalidUrlError; } });
var unsafe_url_error_1 = require("./unsafe-url-error");
Object.defineProperty(exports, "UnsafeUrlError", { enumerable: true, get: function () { return unsafe_url_error_1.UnsafeUrlError; } });
var inn_not_found_error_1 = require("./inn-not-found-error");
Object.defineProperty(exports, "InnNotFoundError", { enumerable: true, get: function () { return inn_not_found_error_1.InnNotFoundError; } });
var invalid_inn_error_1 = require("./invalid-inn-error");
Object.defineProperty(exports, "InvalidInnError", { enumerable: true, get: function () { return invalid_inn_error_1.InvalidInnError; } });
var entity_parse_error_1 = require("./entity-parse-error");
Object.defineProperty(exports, "EntityParseError", { enumerable: true, get: function () { return entity_parse_error_1.EntityParseError; } });
var sanction_not_found_error_1 = require("./sanction-not-found-error");
Object.defineProperty(exports, "SanctionNotFoundError", { enumerable: true, get: function () { return sanction_not_found_error_1.SanctionNotFoundError; } });
