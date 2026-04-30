"use strict";
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
exports.ResourceAwareConfigService = exports.createResourceAwareConfigService = void 0;
/**
 * Core Module Index
 * Resource-Aware Configuration
 */
__exportStar(require("./domain"), exports);
__exportStar(require("./infrastructure"), exports);
__exportStar(require("./application"), exports);
var resource_aware_config_factory_1 = require("./application/services/resource-aware-config.factory");
Object.defineProperty(exports, "createResourceAwareConfigService", { enumerable: true, get: function () { return resource_aware_config_factory_1.createResourceAwareConfigService; } });
var resource_aware_config_service_1 = require("./application/services/resource-aware-config.service");
Object.defineProperty(exports, "ResourceAwareConfigService", { enumerable: true, get: function () { return resource_aware_config_service_1.ResourceAwareConfigService; } });
