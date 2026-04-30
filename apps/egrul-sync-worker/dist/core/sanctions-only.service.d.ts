/**
 * Sanctions Only Sync Service
 *
 * Сервис для синхронизации только санкций из OpenSanctions
 * без полной перезагрузки данных ЕГРЮЛ.
 */
import type { ISanctionRepository } from 'shared/repositories';
import type { SanctionParserService } from './parsers/sanction-parser.service';
import type { FTMHttpClient } from './infrastructure/http-client';
/**
 * Статус синхронизации санкций
 */
export type SanctionsSyncStatus = 'idle' | 'running' | 'completed' | 'error';
/**
 * Результат синхронизации санкций
 */
export interface SanctionsSyncResult {
    readonly status: SanctionsSyncStatus;
    readonly processed: number;
    readonly errors: number;
    readonly message: string;
}
/**
 * Конфигурация синхронизации санкций
 */
export interface SanctionsOnlyConfig {
    readonly apiUrl?: string;
    readonly batchSize?: number;
    readonly timeout?: number;
    readonly abortSignal?: AbortSignal;
}
/**
 * Сервис для синхронизации только санкций
 *
 * Позволяет обновить данные санкций без полной перезагрузки ЕГРЮЛ.
 */
export declare class SanctionsOnlyService {
    private readonly repository;
    private readonly parser;
    private readonly httpClient;
    private readonly circuitBreaker;
    private readonly retryPolicy;
    constructor(repository: ISanctionRepository, parser: SanctionParserService, httpClient: FTMHttpClient);
    /**
     * Выполняет синхронизацию только санкций
     *
     * @param config - опциональная конфигурация
     * @returns результат синхронизации
     */
    run(config?: SanctionsOnlyConfig): Promise<SanctionsSyncResult>;
    /**
     * Триггерит асинхронное обновление кэша через Redis pub/sub
     */
    private triggerCacheRefresh;
    /**
     * Обрабатывает abort синхронизации санкций
     *
     * @remarks
     * 1. Сообщает статус 'deleting'
     * 2. Удаляет частично загруженные данные
     * 3. Сообщает статус 'idle'
     */
    private handleAbort;
}
