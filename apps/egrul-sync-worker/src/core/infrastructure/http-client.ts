import axios, { type AxiosResponse } from 'axios';
import type { SocksProxyAgent } from 'socks-proxy-agent';
import { RETRY_DELAY_MS, PROXY_RETRIES } from '../../config/constants';
import type { IResumeStateStorage } from '../ports';
import { ResumeCoordinator } from '../domain';

/**
 * HTTP клиент для загрузки FTM данных
 *
 * @remarks
 * Infrastructure Adapter для загрузки данных из OpenSanctions.
 * Поддерживает HTTP Range resume через ResumeCoordinator.
 */
export class FTMHttpClient {
  private readonly resumeCoordinator: ResumeCoordinator | null;

  constructor(
    private readonly proxyAgent: SocksProxyAgent | null,
    private readonly userAgent = 'Mozilla/5.0 (compatible; InfoIndexer/1.0; +https://github.com/)',
    resumeStorage?: IResumeStateStorage
  ) {
    // Создаём ResumeCoordinator только если передан storage
    this.resumeCoordinator = resumeStorage
      ? new ResumeCoordinator(resumeStorage, proxyAgent, userAgent)
      : null;
  }

  /**
   * Проверяет является ли ошибка повторяемой
   *
   * @param e - Ошибка
   * @returns true если ошибку можно попробовать снова
   */
  isRetryableError(e: unknown): boolean {
    const err = e as { code?: string; message?: string; cause?: { code?: string } };

    // Локальная ошибка соединения - не повторяем
    if (err?.code === 'ECONNREFUSED' && err?.message?.includes('127.0.0.1')) {
      return false;
    }

    return (
      err?.code === 'ECONNRESET' ||
      err?.cause?.code === 'ECONNRESET' ||
      (typeof err?.message === 'string' && err.message.includes('TLS'))
    );
  }

  /**
   * Выполняет HTTP GET запрос с опциональным прокси
   *
   * @param url - URL для запроса
   * @param useProxy - Использовать ли прокси
   * @returns Axios response
   */
  async fetch(url: string, useProxy: boolean): Promise<AxiosResponse> {
    return axios.get(url, {
      httpsAgent: useProxy && this.proxyAgent ? this.proxyAgent : undefined,
      headers: { 'User-Agent': this.userAgent }
    });
  }

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
  async fetchStream(url: string): Promise<AxiosResponse> {
    const useProxy = !!this.proxyAgent;
    const maxAttempts = useProxy ? PROXY_RETRIES : 1;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        if (i > 0) {
          await this.sleep(RETRY_DELAY_MS * i);
          console.log(`Retry stream ${i}/${maxAttempts}...`);
        }

        const response = await axios.get(url, {
          responseType: 'stream',
          httpsAgent: useProxy && this.proxyAgent ? this.proxyAgent : undefined,
          timeout: 0,
          maxRedirects: 10,
          headers: { 'User-Agent': this.userAgent }
        });

        return response;
      } catch (e) {
        if (!this.isRetryableError(e) || i === maxAttempts - 1) {
          const hint = (e as Error)?.message?.includes('127.0.0.1')
            ? ' Домен заблокирован. Требуется рабочий SOCKS_PROXY_URL.'
            : '';
          throw new Error(`Failed to download dump: ${e}${hint}`);
        }
      }
    }

    throw new Error('Failed to download dump: max attempts exceeded');
  }

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
  async fetchStreamWithResume(url: string): Promise<AxiosResponse> {
    if (!this.resumeCoordinator) {
      throw new Error('Resume storage not configured. Pass IResumeStateStorage to constructor.');
    }

    const useProxy = !!this.proxyAgent;
    const maxAttempts = useProxy ? PROXY_RETRIES : 1;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        if (i > 0) {
          await this.sleep(RETRY_DELAY_MS * i);
          console.log(`Retry stream with resume ${i}/${maxAttempts}...`);
        }

        return await this.resumeCoordinator.fetchStreamWithResume(url);
      } catch (e) {
        if (!this.isRetryableError(e) || i === maxAttempts - 1) {
          const hint = (e as Error)?.message?.includes('127.0.0.1')
            ? ' Домен заблокирован. Требуется рабочий SOCKS_PROXY_URL.'
            : '';
          throw new Error(`Failed to download dump with resume: ${e}${hint}`);
        }
      }
    }

    throw new Error('Failed to download dump: max attempts exceeded');
  }

  /**
   * Получает URL для скачивания FTM дампа
   *
   * @returns URL дампа
   */
  async fetchDownloadUrl(): Promise<string> {
    const url = 'https://www.opensanctions.org/datasets/ru_egrul/';
    const useProxy = !!this.proxyAgent;

    for (let i = 0; i < (useProxy ? PROXY_RETRIES : 1); i++) {
      try {
        if (i > 0) {
          await this.sleep(RETRY_DELAY_MS * i);
          console.log(`Retry ${i}/${PROXY_RETRIES} via proxy...`);
        }

        const response = await this.fetch(url, useProxy);
        const match = response.data.match(
          /href=['"]([^'"]*\/ru_egrul\/entities\.ftm\.json)['"]/
        );

        if (match) {
          let link = match[1];
          if (link.startsWith('/')) {
            link = 'https://data.opensanctions.org' + link;
          }
          return link;
        }

        throw new Error('Could not find FTM JSON download link on OpenSanctions page.');
      } catch (e) {
        if (!this.isRetryableError(e) || i === (useProxy ? PROXY_RETRIES : 1) - 1) {
          throw e;
        }
      }
    }

    throw new Error('Failed to fetch download URL');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
