"use strict";
/**
 * Domain Errors
 *
 * Реэкспорт всех domain ошибок для обратной совместимости
 * @deprecated Используйте импорт из domain/errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionNotFoundError = exports.EntityParseError = exports.InvalidInnError = exports.InnNotFoundError = exports.UnsafeUrlError = exports.InvalidUrlError = exports.InvalidPeriodError = exports.InvalidSanctionProgramError = exports.InvalidCountryCodeError = exports.DomainError = void 0;
var errors_1 = require("./domain/errors");
Object.defineProperty(exports, "DomainError", { enumerable: true, get: function () { return errors_1.DomainError; } });
Object.defineProperty(exports, "InvalidCountryCodeError", { enumerable: true, get: function () { return errors_1.InvalidCountryCodeError; } });
Object.defineProperty(exports, "InvalidSanctionProgramError", { enumerable: true, get: function () { return errors_1.InvalidSanctionProgramError; } });
Object.defineProperty(exports, "InvalidPeriodError", { enumerable: true, get: function () { return errors_1.InvalidPeriodError; } });
Object.defineProperty(exports, "InvalidUrlError", { enumerable: true, get: function () { return errors_1.InvalidUrlError; } });
Object.defineProperty(exports, "UnsafeUrlError", { enumerable: true, get: function () { return errors_1.UnsafeUrlError; } });
Object.defineProperty(exports, "InnNotFoundError", { enumerable: true, get: function () { return errors_1.InnNotFoundError; } });
Object.defineProperty(exports, "InvalidInnError", { enumerable: true, get: function () { return errors_1.InvalidInnError; } });
Object.defineProperty(exports, "EntityParseError", { enumerable: true, get: function () { return errors_1.EntityParseError; } });
Object.defineProperty(exports, "SanctionNotFoundError", { enumerable: true, get: function () { return errors_1.SanctionNotFoundError; } });
