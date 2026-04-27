"use strict";
/**
 * Resume Coordinator — доменный сервис для координации HTTP Range resume
 *
 * Domain Service — бизнес-логика возобновления прерванной загрузки.
 * Реализует HTTP Range resume (RFC 7233).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeCoordinator = void 0;
const axios_1 = __importDefault(require("axios"));
const resume_coordinator_types_1 = require("./resume-coordinator.types");
class ResumeCoordinator {
    storage;
    proxyAgent;
    userAgent;
    constructor(storage, proxyAgent, userAgent = 'Mozilla/5.0 (compatible; InfoIndexer/1.0; +https://github.com/)') {
        this.storage = storage;
        this.proxyAgent = proxyAgent;
        this.userAgent = userAgent;
    }
    async fetchStreamWithResume(url, onSave) {
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
    getResumeInfo(saved) {
        if (!saved) {
            return { shouldResume: false, startFrom: 0 };
        }
        const age = Date.now() - saved.timestamp;
        if (age > resume_coordinator_types_1.MAX_STATE_AGE_MS) {
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
    buildHeaders(resumeInfo) {
        const headers = { 'User-Agent': this.userAgent };
        if (!resumeInfo.shouldResume) {
            return headers;
        }
        headers['Range'] = `bytes=${resumeInfo.startFrom}-`;
        if (resumeInfo.etag) {
            headers['If-Range'] = resumeInfo.etag;
        }
        else if (resumeInfo.lastModified) {
            headers['If-Range'] = resumeInfo.lastModified;
        }
        return headers;
    }
    async executeRequest(url, headers) {
        return axios_1.default.get(url, {
            responseType: 'stream',
            httpsAgent: this.proxyAgent || undefined,
            timeout: 0,
            maxRedirects: 10,
            headers,
            validateStatus: (status) => status === 200 || status === 206
        });
    }
    async handleResponse(response, url, resumeInfo, onSave) {
        const etag = response.headers['etag'];
        const lastModified = response.headers['last-modified'];
        const contentRange = response.headers['content-range'];
        let totalBytes = this.extractTotalBytes(contentRange);
        if (totalBytes === 0) {
            const contentLength = response.headers['content-length'];
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
    extractTotalBytes(contentRange) {
        if (!contentRange) {
            return 0;
        }
        const match = contentRange.match(/\/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
    }
    setupProgressTracking(response, url, startFrom, totalBytes, etag, lastModified, onSave) {
        let downloaded = startFrom;
        let lastSaved = startFrom;
        response.data.on('data', (chunk) => {
            downloaded += chunk.length;
            if (downloaded - lastSaved >= resume_coordinator_types_1.SAVE_INTERVAL_BYTES) {
                lastSaved = downloaded;
                this.saveStateAsync(url, { downloadedBytes: downloaded, totalBytes, etag, lastModified });
            }
        });
        response.data.on('end', () => {
            this.saveStateAsync(url, { downloadedBytes: downloaded, totalBytes, etag, lastModified });
        });
    }
    saveStateAsync(url, params) {
        const state = {
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
exports.ResumeCoordinator = ResumeCoordinator;
