/**
 * Resume Coordinator — доменный сервис для координации HTTP Range resume
 *
 * Domain Service — бизнес-логика возобновления прерванной загрузки.
 * Реализует HTTP Range resume (RFC 7233).
 */
import { type AxiosResponse } from 'axios';
import type { SocksProxyAgent } from 'socks-proxy-agent';
import type { IResumeStateStorage } from '../ports';
import { type SaveStateParams } from './resume-coordinator.types';
export declare class ResumeCoordinator {
    private readonly storage;
    private readonly proxyAgent;
    private readonly userAgent;
    constructor(storage: IResumeStateStorage, proxyAgent: SocksProxyAgent | null, userAgent?: string);
    fetchStreamWithResume(url: string, onSave?: (params: SaveStateParams) => void): Promise<AxiosResponse>;
    private getResumeInfo;
    private buildHeaders;
    private executeRequest;
    private handleResponse;
    private extractTotalBytes;
    private setupProgressTracking;
    private saveStateAsync;
}
