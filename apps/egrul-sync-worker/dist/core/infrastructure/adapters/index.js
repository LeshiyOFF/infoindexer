"use strict";
/**
 * Infrastructure Adapters Index
 *
 * @remarks
 * Re-exports all infrastructure adapters.
 * Adapters implement ports defined in domain layer.
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
// Staging & Production adapters
__exportStar(require("./clickhouse-staging.adapter"), exports);
__exportStar(require("./clickhouse-production.adapter"), exports);
__exportStar(require("./clickhouse-identity-resolver.adapter"), exports);
// Monitoring adapters
__exportStar(require("./memory-monitor-adapter.service"), exports);
// Logger adapter (Iteration 4)
__exportStar(require("./console-logger.adapter"), exports);
