"use strict";
/**
 * Domain Ports Index
 *
 * @remarks
 * Re-exports all domain ports.
 * Ports define contracts for infrastructure adapters.
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
// Existing ports (re-exported from core/ports)
__exportStar(require("../../ports/i-mv-insert.port"), exports);
__exportStar(require("../../ports/i-direct-insert.port"), exports);
__exportStar(require("../../ports/i-sync-state-storage.port"), exports);
__exportStar(require("../../ports/i-resume-state-storage.port"), exports);
__exportStar(require("../../ports/i-circuit-breaker-manager.port"), exports);
// Staging & Transform ports
__exportStar(require("./i-staging-storage.port"), exports);
__exportStar(require("./i-production-storage.port"), exports);
__exportStar(require("./i-memory-monitor.port"), exports);
__exportStar(require("./i-transform-service.port"), exports);
__exportStar(require("./i-identity-resolver.port"), exports);
__exportStar(require("./i-health-check.port"), exports);
// Logger & Worker ports (Iteration 4)
__exportStar(require("./i-logger.port"), exports);
__exportStar(require("./i-worker.port"), exports);
