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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSResourceDiscoveryAdapter = void 0;
/**
 * OS Resource Discovery Adapter
 *
 * @remarks
 * Detects system memory from Node.js os module.
 * Fallback adapter for non-containerized environments.
 *
 * Implements IResourceDiscoveryPort following Dependency Inversion.
 */
const os = __importStar(require("os"));
const resource_info_vo_1 = require("../../domain/value-objects/resource-info.vo");
const memory_size_vo_1 = require("../../domain/value-objects/memory-size.vo");
/**
 * OS Resource Discovery Adapter
 */
class OSResourceDiscoveryAdapter {
    /**
     * Detect resources from OS
     */
    detect() {
        const totalBytes = os.totalmem();
        const freeBytes = os.freemem();
        return resource_info_vo_1.ResourceInfo.withAvailable(totalBytes, freeBytes, resource_info_vo_1.ResourceSource.OS);
    }
    /**
     * Get total system memory
     */
    getTotalMemory() {
        return memory_size_vo_1.MemorySize.fromBytes(os.totalmem());
    }
    /**
     * Get free system memory
     */
    getFreeMemory() {
        return memory_size_vo_1.MemorySize.fromBytes(os.freemem());
    }
    /**
     * Get memory utilization (0.0 - 1.0)
     */
    getMemoryUtilization() {
        const total = os.totalmem();
        const free = os.freemem();
        return (total - free) / total;
    }
    /**
     * Get number of CPUs
     */
    getCPUCount() {
        return os.cpus().length;
    }
}
exports.OSResourceDiscoveryAdapter = OSResourceDiscoveryAdapter;
