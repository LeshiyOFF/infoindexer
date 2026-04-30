import { type AxiosResponse } from 'axios';
import type { SocksProxyAgent } from 'socks-proxy-agent';
import type { IResumeStateStorage } from '../ports';
/**
 * HTTP клиент для загрузки FTM данных
 *
 * @remarks
 * Infrastructure Adapter для загрузки данных из OpenSanctions.
 * Поддерживает HTTP Range resume через ResumeCoordinator.
 */
export declare class FTMHttpClient {
    private readonly proxyAgent;
    private readonly userAgent;
    private readonly resumeCoordinator;
    constructor(proxyAgent: SocksProxyAgent | null, userAgent?: string, resumeStorage?: IResumeStateStorage);
    /**
     * Проверяет является ли ошибка повторяемой
     *
     * @param e - Ошибка
     * @returns true если ошибку можно попробовать снова
     */
    isRetryableError(e: unknown): boolean;
    /**
     * Выполняет HTTP GET запрос с опциональным прокси
     *
     * @param url - URL для запроса
     * @param useProxy - Использовать ли прокси
     * @returns Axios response
     */
    fetch(url: string, useProxy: boolean): Promise<AxiosResponse>;
    /**
     * Загружает FTM dump потоковым способом
     *
     * @remarks
     * Базовый метод без resume. Для возобновления после прерывания
     * используйте fetchStreamWithResume.
     *
     * @param url - URL дампа
     * @returns Axios response с потоком
     */
    fetchStream(url: string): Promise<AxiosResponse>;
    /**
     * Загружает FTM dump с поддержкой resume
     *
     * @remarks
     * Использует HTTP Range header для возобновления прерванной загрузки.
     * Сохраняет позицию каждые 10MB.
     *
     * @param url - URL дампа
     * @returns Axios response с потоком
     * @throws Error если resumeStorage не был передан в конструктор
     */
    fetchStreamWithResume(url: string): Promise<AxiosResponse>;
    /**
     * Получает URL для скачивания FTM дампа
     *
     * @returns URL дампа
     */
    fetchDownloadUrl(): Promise<string>;
    private sleep;
}
