/**
 * Экспорт всех Ports
 *
 * @remarks
 * Единая точка импорта для всех интерфейсов портов.
 */
export type { BrowserContextOptions, IBrowserService } from './i-browser.port';
export type { IEmailService } from './i-email.port';
export type { IPhoneService } from './i-phone.port';
export type { IDuckDuckGoService } from './i-duckduckgo.port';
export type { IEnrichmentService, IContactPrioritizer } from './i-enrichment.port';
export type { IQueueService } from './i-queue.port';
