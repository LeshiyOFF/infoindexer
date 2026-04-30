"use strict";
/**
 * Rate Limit Domain Layer
 *
 * @remarks
 * Domain Layer: Экспорт всех rate limit компонентов.
 *
 * Iteration 14: Rate Limiting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitResult = exports.RATE_LIMITS = exports.RateLimitConfig = void 0;
var rate_limit_config_vo_1 = require("./rate-limit-config.vo");
Object.defineProperty(exports, "RateLimitConfig", { enumerable: true, get: function () { return rate_limit_config_vo_1.RateLimitConfig; } });
Object.defineProperty(exports, "RATE_LIMITS", { enumerable: true, get: function () { return rate_limit_config_vo_1.RATE_LIMITS; } });
var rate_limit_result_dto_1 = require("./rate-limit-result.dto");
Object.defineProperty(exports, "RateLimitResult", { enumerable: true, get: function () { return rate_limit_result_dto_1.RateLimitResult; } });
