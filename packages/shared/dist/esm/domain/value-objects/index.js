"use strict";
/**
 * Value Objects Index
 *
 * Централизованный экспорт всех Value Objects
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureUrl = exports.SanctionPeriod = exports.SanctionProgram = exports.Authority = exports.CountryCode = void 0;
var country_code_1 = require("./country-code");
Object.defineProperty(exports, "CountryCode", { enumerable: true, get: function () { return country_code_1.CountryCode; } });
var authority_1 = require("./authority");
Object.defineProperty(exports, "Authority", { enumerable: true, get: function () { return authority_1.Authority; } });
var sanction_program_1 = require("./sanction-program");
Object.defineProperty(exports, "SanctionProgram", { enumerable: true, get: function () { return sanction_program_1.SanctionProgram; } });
var sanction_period_1 = require("./sanction-period");
Object.defineProperty(exports, "SanctionPeriod", { enumerable: true, get: function () { return sanction_period_1.SanctionPeriod; } });
var secure_url_1 = require("./secure-url");
Object.defineProperty(exports, "SecureUrl", { enumerable: true, get: function () { return secure_url_1.SecureUrl; } });
