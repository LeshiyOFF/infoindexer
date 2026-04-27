/**
 * Resume Coordinator — доменный сервис для координации HTTP Range resume
 *
 * Domain Service — бизнес-логика возобновления прерванной загрузки.
 * Реализует HTTP Range resume (RFC 7233).
 */

import axios, { type AxiosResponse } from 'axios';
import type { SocksProxyAgent } from 'socks-proxy-agent';
import type { IResumeStateStorage, ResumeState } from '../ports';
import { MAX_STATE_AGE_MS, SAVE_INTERVAL_BYTES, type SaveStateParams, type ResumeInfo } from './resume-coordinator.types';

export class ResumeCoordinator {
  constructor(
    private readonly storage: IResumeStateStorage,
    private readonly proxyAgent: SocksProxyAgent | null,
    private readonly userAgent = 'Mozilla/5.0 (compatible; InfoIndexer/1.0; +https://github.com/)'
  ) {}

  async fetchStreamWithResume(
    url: string,
    onSave?: (params: SaveStateParams) => void
  ): Promise<AxiosResponse> {
    const saved = await this.storage.load(url);
    const resumeInfo = this.getResumeInfo(saved);

    if (resumeInfo.shouldResume) {
      console.log(`Resuming download from byte ${resumeInfo.startFrom}`);
    }

    const headers = this.buildHeaders(resumeInfo);
    const response = await this.executeRequest(url, headers);
    await this.handleResponse(response, url, resumeInfo, onSave);

    return response;
  }

  private getResumeInfo(saved: ResumeState | null): ResumeInfo {
    if (!saved) {
      return { shouldResume: false, startFrom: 0 };
    }

    const age = Date.now() - saved.timestamp;
    if (age > MAX_STATE_AGE_MS) {
      console.log('Saved state is too old, starting fresh');
      return { shouldResume: false, startFrom: 0 };
    }

    if (saved.downloadedBytes === 0) {
      return { shouldResume: false, startFrom: 0 };
    }

    return {
      shouldResume: true,
      startFrom: saved.downloadedBytes,
      etag: saved.etag,
      lastModified: saved.lastModified
    };
  }

  private buildHeaders(resumeInfo: ResumeInfo): Record<string, string> {
    const headers: Record<string, string> = { 'User-Agent': this.userAgent };

    if (!resumeInfo.shouldResume) {
      return headers;
    }

    headers['Range'] = `bytes=${resumeInfo.startFrom}-`;

    if (resumeInfo.etag) {
      headers['If-Range'] = resumeInfo.etag;
    } else if (resumeInfo.lastModified) {
      headers['If-Range'] = resumeInfo.lastModified;
    }

    return headers;
  }

  private async executeRequest(url: string, headers: Record<string, string>): Promise<AxiosResponse> {
    return axios.get(url, {
      responseType: 'stream',
      httpsAgent: this.proxyAgent || undefined,
      timeout: 0,
      maxRedirects: 10,
      headers,
      validateStatus: (status) => status === 200 || status === 206
    });
  }

  private async handleResponse(
    response: AxiosResponse,
    url: string,
    resumeInfo: ResumeInfo,
    onSave?: (params: SaveStateParams) => void
  ): Promise<void> {
    const etag = response.headers['etag'] as string | undefined;
    const lastModified = response.headers['last-modified'] as string | undefined;
    const contentRange = response.headers['content-range'] as string | undefined;

    let totalBytes = this.extractTotalBytes(contentRange);
    if (totalBytes === 0) {
      const contentLength = response.headers['content-length'] as string | undefined;
      totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    }

    if (response.status !== 206 && resumeInfo.shouldResume) {
      console.log('Server does not support Range, starting fresh');
      await this.storage.clear(url);
    }

    if (onSave) {
      this.setupProgressTracking(response, url, resumeInfo.startFrom, totalBytes, etag, lastModified, onSave);
    }
  }

  private extractTotalBytes(contentRange: string | undefined): number {
    if (!contentRange) {
      return 0;
    }
    const match = contentRange.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private setupProgressTracking(
    response: AxiosResponse,
    url: string,
    startFrom: number,
    totalBytes: number,
    etag: string | undefined,
    lastModified: string | undefined,
    onSave: (params: SaveStateParams) => void
  ): void {
    let downloaded = startFrom;
    let lastSaved = startFrom;

    response.data.on('data', (chunk: Buffer) => {
      downloaded += chunk.length;
      if (downloaded - lastSaved >= SAVE_INTERVAL_BYTES) {
        lastSaved = downloaded;
        this.saveStateAsync(url, { downloadedBytes: downloaded, totalBytes, etag, lastModified });
      }
    });

    response.data.on('end', () => {
      this.saveStateAsync(url, { downloadedBytes: downloaded, totalBytes, etag, lastModified });
    });
  }

  private saveStateAsync(url: string, params: SaveStateParams): void {
    const state: ResumeState = {
      url,
      downloadedBytes: params.downloadedBytes,
      totalBytes: params.totalBytes,
      etag: params.etag,
      lastModified: params.lastModified,
      timestamp: Date.now()
    };

    this.storage.save(url, state).catch((error) => {
      console.error('Failed to save resume state:', error);
    });
  }
}
