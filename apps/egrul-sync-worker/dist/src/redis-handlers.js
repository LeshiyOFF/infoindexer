"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRedisSubscriptions = setupRedisSubscriptions;
exports.registerOperation = registerOperation;
exports.abortOperation = abortOperation;
/**
 * Redis Message Handlers
 *
 * @remarks
 * Handles Redis Pub/Sub messages for sync operations.
 * Поддерживает команды: start, abort, health check.
 */
const shared_1 = require("shared");
const app_state_1 = require("./app-state");
const sync_handlers_1 = require("./sync-handlers");
const shutdown_handlers_1 = require("./shutdown-handlers");
/**
 * Setup Redis subscriptions and message handlers
 */
function setupRedisSubscriptions() {
    const channels = [
        'sync:egrul:start',
        'sync:sanctions:start',
        'sync:refresh:start',
        'sync:egrul:abort',
        'sync:sanctions:abort',
        'sync:health:check'
    ];
    for (const channel of channels) {
        shared_1.redisSub.subscribe(channel, (err) => {
            if (err) {
                console.error(`Failed to subscribe to ${channel}:`, err);
            }
            else {
                console.log(`EGRUL Sync Worker: Successfully subscribed to channel "${channel}"`);
            }
        });
    }
    shared_1.redisSub.on('message', async (channel, message) => {
        console.log(`Worker received message on channel [${channel}]`);
        if (!(0, app_state_1.getAppState)()) {
            console.error('Application not initialized');
            return;
        }
        try {
            switch (channel) {
                case 'sync:egrul:start':
                    await (0, sync_handlers_1.handleEgrulSync)(message);
                    break;
                case 'sync:sanctions:start':
                    await (0, sync_handlers_1.handleSanctionsSync)();
                    break;
                case 'sync:refresh:start':
                    await (0, sync_handlers_1.handleRefreshCache)();
                    break;
                case 'sync:egrul:abort':
                    abortOperation('egrul');
                    break;
                case 'sync:sanctions:abort':
                    abortOperation('sanctions');
                    break;
                case 'sync:health:check':
                    await handleHealthCheck(message);
                    break;
            }
        }
        catch (error) {
            console.error(`Error handling message on channel [${channel}]:`, error);
        }
    });
}
/**
 * Обработчик health check запросов
 *
 * @remarks
 * Получает health report и публикует в канал sync:health:status.
 */
async function handleHealthCheck(message) {
    const state = (0, app_state_1.getAppState)();
    if (!state || !state.healthCheckService) {
        console.error('Health check service not initialized');
        await publishHealthError('Health check service not initialized');
        return;
    }
    try {
        const health = await state.healthCheckService.getFullHealth();
        await shared_1.redisClient.publish('sync:health:status', JSON.stringify({
            success: true,
            data: health,
            timestamp: Date.now()
        }));
        console.log(`[HealthCheck] Status: ${health.status}, Components: ${Object.keys(health.components).length}`);
    }
    catch (error) {
        console.error('[HealthCheck] Error:', error);
        await publishHealthError(error instanceof Error ? error.message : 'Unknown error');
    }
}
/**
 * Публикует ошибку health check
 */
async function publishHealthError(message) {
    await shared_1.redisClient.publish('sync:health:status', JSON.stringify({
        success: false,
        error: message,
        timestamp: Date.now()
    }));
}
/**
 * Register new operation
 */
function registerOperation(type) {
    const controller = new AbortController();
    const activeOperations = (0, shutdown_handlers_1.getActiveOperations)();
    activeOperations.set(type, { controller, type });
    return controller;
}
/**
 * Abort operation by type
 */
function abortOperation(type) {
    const activeOperations = (0, shutdown_handlers_1.getActiveOperations)();
    const operation = activeOperations.get(type);
    if (operation) {
        operation.controller.abort();
        (0, shutdown_handlers_1.deleteActiveOperation)(type);
        console.log(`Operation ${type} aborted`);
        return true;
    }
    return false;
}
