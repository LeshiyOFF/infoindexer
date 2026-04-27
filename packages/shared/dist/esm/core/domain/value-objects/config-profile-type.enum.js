/**
 * Configuration Profile Type enum
 *
 * @remarks
 * Extracted to avoid circular dependency between
 * config-profile.vo.ts and config-profile.constants.ts
 */
export var ConfigProfileType;
(function (ConfigProfileType) {
    ConfigProfileType["LOW"] = "low";
    ConfigProfileType["STANDARD"] = "standard";
    ConfigProfileType["HIGH"] = "high";
})(ConfigProfileType || (ConfigProfileType = {}));
