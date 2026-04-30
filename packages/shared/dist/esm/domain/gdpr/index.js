"use strict";
/**
 * GDPR Domain Layer Exports
 *
 * @remarks
 * Domain Layer: Public API for GDPR deletion.
 * Part of GDPR/FZ-152 right-to-delete implementation.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeletionCounts = exports.GdprDeleteResult = exports.GdprDeleteRequest = exports.innValidator = exports.InnValidator = void 0;
// Validator
var inn_validator_1 = require("./inn.validator");
Object.defineProperty(exports, "InnValidator", { enumerable: true, get: function () { return inn_validator_1.InnValidator; } });
Object.defineProperty(exports, "innValidator", { enumerable: true, get: function () { return inn_validator_1.innValidator; } });
// DTOs
var gdpr_delete_request_dto_1 = require("./gdpr-delete-request.dto");
Object.defineProperty(exports, "GdprDeleteRequest", { enumerable: true, get: function () { return gdpr_delete_request_dto_1.GdprDeleteRequest; } });
var gdpr_delete_result_dto_1 = require("./gdpr-delete-result.dto");
Object.defineProperty(exports, "GdprDeleteResult", { enumerable: true, get: function () { return gdpr_delete_result_dto_1.GdprDeleteResult; } });
var gdpr_delete_result_dto_2 = require("./gdpr-delete-result.dto");
Object.defineProperty(exports, "createDeletionCounts", { enumerable: true, get: function () { return gdpr_delete_result_dto_2.createDeletionCounts; } });
