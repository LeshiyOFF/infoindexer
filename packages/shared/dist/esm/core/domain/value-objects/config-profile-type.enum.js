"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigProfileType = void 0;
/**
 * Configuration Profile Type enum
 *
 * @remarks
 * Extracted to avoid circular dependency between
 * config-profile.vo.ts and config-profile.constants.ts
 */
var ConfigProfileType;
(function (ConfigProfileType) {
    ConfigProfileType["LOW"] = "low";
    ConfigProfileType["STANDARD"] = "standard";
    ConfigProfileType["HIGH"] = "high";
})(ConfigProfileType || (exports.ConfigProfileType = ConfigProfileType = {}));
