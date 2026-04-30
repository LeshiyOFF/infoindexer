"use strict";
/**
 * EGRUL Sync Worker Entry Point
 *
 * Запускает синхронизацию данных из OpenSanctions/EGRUL:
 * - Полная синхронизация (EGRUL + Санкции)
 * - Только санкции
 *
 * @remarks
 * Поддерживает HTTP Range resume для прерванных загрузок.
 * Graceful shutdown через GracefulShutdownService (SOLID).
 * Resource-Aware Configuration для auto-tuning ClickHouse настроек.
 *
 * Миграции применяются отдельным migration-worker сервисом.
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
const app_state_1 = require("./app-state");
const app_initializer_1 = require("./app-initializer");
const redis_handlers_1 = require("./redis-handlers");
const shutdown_handlers_1 = require("./shutdown-handlers");
const service_factory_1 = require("./service-factory");
// ===============================
// Main Entry Point
// ===============================
(async () => {
    try {
        // Resource-Aware Configuration & ClickHouse Client
        const { clickhouseClient } = await (0, app_initializer_1.initializeApp)();
        // Initialize proxy agent
        const proxyUrl = process.env.SOCKS_PROXY_URL;
        const proxyUrlWithRemoteDns = proxyUrl?.replace(/^socks5:\/\//, 'socks5h://');
        let proxyAgent = null;
        if (proxyUrlWithRemoteDns) {
            const { SocksProxyAgent } = await Promise.resolve().then(() => __importStar(require('socks-proxy-agent')));
            proxyAgent = new SocksProxyAgent(proxyUrlWithRemoteDns);
        }
        // Initialize services
        const appState = await (0, service_factory_1.initializeServices)(clickhouseClient, proxyAgent);
        (0, app_state_1.setAppState)(appState);
        // Setup shutdown handlers
        process.on('SIGINT', () => (0, shutdown_handlers_1.handleShutdownSignal)('SIGINT'));
        process.on('SIGTERM', () => (0, shutdown_handlers_1.handleShutdownSignal)('SIGTERM'));
        // Setup Redis subscriptions
        (0, redis_handlers_1.setupRedisSubscriptions)();
        console.log(proxyUrl ? `Using SOCKS5 proxy: ${proxyUrl}` : 'Connecting directly (no proxy)');
        console.log('EGRUL Sync Worker started. Listening for commands...');
    }
    catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
})();
