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

import { EgrulWorkerFactory } from './core/factories';
import { setAppState } from './app-state';
import { initializeApp } from './app-initializer';
import { setupRedisSubscriptions } from './redis-handlers';
import { handleShutdownSignal } from './shutdown-handlers';
import { initializeServices } from './service-factory';
import type { SocksProxyAgent } from 'socks-proxy-agent';

// ===============================
// Main Entry Point
// ===============================

(async () => {
  try {
    // Resource-Aware Configuration & ClickHouse Client
    const { clickhouseClient } = await initializeApp();

    // Initialize proxy agent
    const proxyUrl = process.env.SOCKS_PROXY_URL;
    const proxyUrlWithRemoteDns = proxyUrl?.replace(/^socks5:\/\//, 'socks5h://');
    let proxyAgent: SocksProxyAgent | null = null;

    if (proxyUrlWithRemoteDns) {
      const { SocksProxyAgent } = await import('socks-proxy-agent');
      proxyAgent = new SocksProxyAgent(proxyUrlWithRemoteDns);
    }

    // Initialize services
    const appState = await initializeServices(clickhouseClient, proxyAgent);
    setAppState(appState);

    // Setup shutdown handlers
    process.on('SIGINT', () => handleShutdownSignal('SIGINT'));
    process.on('SIGTERM', () => handleShutdownSignal('SIGTERM'));

    // Setup Redis subscriptions (async - wait for completion)
    await setupRedisSubscriptions();

    console.log(proxyUrl ? `Using SOCKS5 proxy: ${proxyUrl}` : 'Connecting directly (no proxy)');
    console.log('EGRUL Sync Worker started. Listening for commands...');

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();
