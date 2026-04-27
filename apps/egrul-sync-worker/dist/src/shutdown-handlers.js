"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleShutdownSignal = handleShutdownSignal;
exports.saveActiveOperationsProgress = saveActiveOperationsProgress;
exports.getActiveOperations = getActiveOperations;
exports.deleteActiveOperation = deleteActiveOperation;
const app_state_1 = require("./app-state");
/**
 * Handle shutdown signals (SIGINT, SIGTERM)
 */
async function handleShutdownSignal(signal) {
    const appState = (0, app_state_1.getAppState)();
    if (!appState) {
        process.exit(1);
        return;
    }
    const result = await appState.gracefulShutdownService.shutdown({
        signal,
        timestamp: Date.now()
    });
    if (result.success) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
}
/**
 * Save progress for active operations
 */
async function saveActiveOperationsProgress() {
    const appState = (0, app_state_1.getAppState)();
    if (!appState) {
        return 0;
    }
    const operations = getActiveOperations();
    let saved = 0;
    for (const [type, operation] of operations) {
        if (operation.controller.signal.aborted) {
            continue;
        }
        operation.controller.abort();
        deleteActiveOperation(type);
        saved++;
    }
    return saved;
}
/**
 * Active operations storage (module-level)
 */
const activeOperations = new Map();
function getActiveOperations() {
    return activeOperations;
}
function deleteActiveOperation(type) {
    activeOperations.delete(type);
}
