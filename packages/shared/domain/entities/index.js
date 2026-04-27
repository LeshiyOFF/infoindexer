"use strict";
/**
 * Entities Index
 *
 * Централизованный экспорт всех Domain Entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionList = exports.Sanction = void 0;
var sanction_1 = require("./sanction");
Object.defineProperty(exports, "Sanction", { enumerable: true, get: function () { return sanction_1.Sanction; } });
var sanction_list_1 = require("./sanction-list");
Object.defineProperty(exports, "SanctionList", { enumerable: true, get: function () { return sanction_list_1.SanctionList; } });
