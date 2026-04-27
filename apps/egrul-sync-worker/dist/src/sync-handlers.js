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
exports.handleEgrulSync = handleEgrulSync;
exports.handleSanctionsSync = handleSanctionsSync;
exports.handleRefreshCache = handleRefreshCache;
/**
 * Sync Operation Handlers
 *
 * @remarks
 * Handles EGRUL sync, sanctions sync, and cache refresh operations.
 */
const app_state_1 = require("./app-state");
const redis_handlers_1 = require("./redis-handlers");
const shutdown_handlers_1 = require("./shutdown-handlers");
/**
 * Handle EGRUL + Sanctions full sync
 */
async function handleEgrulSync(message) {
    const appState = (0, app_state_1.getAppState)();
    if (!appState)
        return;
    console.log('Command recognized. Triggering full EGRUL + Sanctions sync...');
    if (appState.gracefulShutdownService.isShuttingDown()) {
        console.log('Shutdown in progress, ignoring new sync request');
        return;
    }
    const activeOperations = (0, shutdown_handlers_1.getActiveOperations)();
    if (activeOperations.has('egrul')) {
        console.log('EGRUL sync already running');
        return;
    }
    const controller = (0, redis_handlers_1.registerOperation)('egrul');
    const enableEnrichment = message === 'enrichment:true' || process.env.ENABLE_ENRICHMENT === 'true';
    try {
        await appState.egrulSyncService.run({ enableEnrichment, abortSignal: controller.signal });
    }
    catch (error) {
        if (controller.signal.aborted) {
            console.log('EGRUL sync aborted by user');
        }
        else {
            console.error('Unhandled runEgrulSync error:', error);
        }
    }
    finally {
        (0, shutdown_handlers_1.deleteActiveOperation)('egrul');
    }
}
/**
 * Handle sanctions-only sync
 */
async function handleSanctionsSync() {
    const appState = (0, app_state_1.getAppState)();
    if (!appState)
        return;
    console.log('Command recognized. Triggering sanctions-only sync...');
    if (appState.gracefulShutdownService.isShuttingDown()) {
        console.log('Shutdown in progress, ignoring new sync request');
        return;
    }
    const activeOperations = (0, shutdown_handlers_1.getActiveOperations)();
    if (activeOperations.has('sanctions')) {
        console.log('Sanctions sync already running');
        return;
    }
    const controller = (0, redis_handlers_1.registerOperation)('sanctions');
    try {
        const result = await appState.sanctionsOnlyService.run({ abortSignal: controller.signal });
        console.log(`Sanctions sync completed: ${result.status}, processed: ${result.processed}, errors: ${result.errors}`);
        if (result.status === 'error') {
            console.error('Sanctions sync error:', result.message);
        }
    }
    catch (error) {
        if (controller.signal.aborted) {
            console.log('Sanctions sync aborted by user');
        }
        else {
            console.error('Sanctions sync error:', error);
        }
    }
    finally {
        (0, shutdown_handlers_1.deleteActiveOperation)('sanctions');
    }
}
/**
 * Handle cache refresh
 */
async function handleRefreshCache() {
    const appState = (0, app_state_1.getAppState)();
    if (!appState)
        return;
    console.log('Command recognized. Triggering companies_meta sync...');
    if (appState.gracefulShutdownService.isShuttingDown()) {
        console.log('Shutdown in progress, ignoring sync request');
        return;
    }
    try {
        // Materialized View обновляется автоматически при INSERT.
        // Этот sync только для companies_meta изменений (director, name, status).
        const { createCompaniesMetaSyncWorker } = await Promise.resolve().then(() => __importStar(require('shared')));
        const worker = createCompaniesMetaSyncWorker();
        const stats = await worker.syncOnce();
        console.log(`Companies meta sync completed: ${stats.innsProcessed} INNs in ${stats.durationMs}ms`);
        if (stats.error) {
            console.error(`Sync error: ${stats.error}`);
        }
    }
    catch (error) {
        console.error('Companies meta sync error:', error);
    }
}
