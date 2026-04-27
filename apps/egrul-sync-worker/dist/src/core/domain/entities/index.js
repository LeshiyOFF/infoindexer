"use strict";
/**
 * Domain Entities Index
 *
 * @remarks
 * Re-exports all domain entities for MV + Staging approach.
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
// Production entities (MV-backed)
__exportStar(require("./egrul-director.entity"), exports);
__exportStar(require("./egrul-founder.entity"), exports);
// Staging entities (raw FTM data)
__exportStar(require("./staging-company.entity"), exports);
__exportStar(require("./staging-directorship.entity"), exports);
__exportStar(require("./staging-ownership.entity"), exports);
