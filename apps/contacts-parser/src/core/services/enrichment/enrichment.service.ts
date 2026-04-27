/**
 * Adapter для обогащения контактной информации
 *
 * @remarks
 * Реализует Port IEnrichmentService для OSINT обогащения.
 * Координирует работу всех сервисов для сбора контактных данных.
 */

import { clickhouseClient, redisClient } from 'shared';
import { BATCH_TTL_SEC, PAGE_TIMEOUT_MS } from '../../constants';
import type { BrowserContext } from 'playwright';
import type { ContactInfo, EnrichmentResult, SourceStatus } from '../../types/contacts.types';
import type { IBrowserService } from '../../ports/i-browser.port';
import type { IEnrichmentService } from '../../ports/i-enrichment.port';
import type { IDuckDuckGoService } from '../../ports/i-duckduckgo.port';
import type { EmailService } from '../email.service';
import type { PhoneService } from '../phone.service';
import type { ContactPrioritizer } from '../contact-prioritizer.service';
import { ScraperHelper } from './scraper.helper';
import { EnrichmentStagesHelper } from './stages.helper';

/**
 * Сервис для обогащения контактной информации
 *
 * @remarks
 * Выполняет многоэтапный OSINT поиск контактов организации.
 */
export class EnrichmentService implements IEnrichmentService {
  private readonly scraper: ScraperHelper;
  private readonly stages: EnrichmentStagesHelper;

  constructor(
    private readonly browser: IBrowserService,
    ddg: IDuckDuckGoService,
    private readonly email: EmailService,
    private readonly phone: PhoneService,
    private readonly prioritizer: ContactPrioritizer
  ) {
    this.scraper = new ScraperHelper(email, phone);
    this.stages = new EnrichmentStagesHelper(ddg, email, phone);
  }

  /**
   * Получает обогащённую контактную информацию по ИНН
   */
  async getEnrichedData(inn: string, batchId?: string): Promise<EnrichmentResult> {
    let context: BrowserContext | null = null;
    const contacts: ContactInfo = { emails: [], phones: [], websites: [], sourcesChecked: [] };
    const addSource = (name: string, found: boolean, status: SourceStatus['status'] = 'completed') => {
      contacts.sourcesChecked.push({ name, found, status });
    };

    try {
      context = await this.browser.createContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
      console.log(`[Waterfall] Enrichment INN: ${inn}`);
      await redisClient.hset(`contacts:status:${inn}`, { status: 'running' });

      await this.fetchFromClickHouse(inn, contacts, addSource);

      const page = await context.newPage();
      page.setDefaultTimeout(PAGE_TIMEOUT_MS);

      await this.scraper.scrapeChecko(inn, page, contacts, addSource);
      await this.scraper.searchCompanyOnDDG(inn, page, contacts, addSource);
      await this.scraper.scrapeOfficialSite(page, contacts, addSource);

      if (contacts.directorName) {
        await this.stages.osintDirector(inn, page, contacts, contacts.directorName, contacts.name || '', addSource);
      } else {
        this.skipDirectorStages(addSource);
      }

      await this.stages.searchRegistries(inn, page, contacts, addSource);

      const result = this.buildFinalResult(contacts);
      await this.saveResult(inn, batchId, result);
      return result;
    } catch (err) {
      await this.handleError(inn, batchId, err as Error);
      throw err;
    } finally {
      if (context) await context.close();
    }
  }

  /**
   * Получает данные из ClickHouse
   */
  private async fetchFromClickHouse(inn: string, contacts: ContactInfo, addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): Promise<void> {
    try {
      const chResult = await clickhouseClient.query({
        query: 'SELECT any(director) as director, any(name) as name FROM companies_meta WHERE inn = {inn: String}',
        query_params: { inn },
        format: 'JSONEachRow'
      });
      const rows = (await chResult.json()) as { director?: string; name?: string }[];
      if (rows && rows.length > 0) {
        if (rows[0].director) contacts.directorName = rows[0].director;
        if (rows[0].name) contacts.name = rows[0].name;
      }
      addSource('Внутренняя БД', !!(contacts.directorName || contacts.name));
    } catch (e) {
      console.error('[Waterfall] ClickHouse error:', e);
      addSource('Внутренняя БД', false, 'error');
    }
  }

  /** Пропускает стадии по директору (если не найден) */
  private skipDirectorStages(addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void): void {
    this.stages.getDirectorStagesLabels().forEach(l => addSource(l, false, 'skipped'));
  }

  /** Строит финальный результат с приоритизацией контактов */
  private buildFinalResult(contacts: ContactInfo): EnrichmentResult {
    return {
      name: contacts.name,
      director: contacts.directorName,
      emails: this.prioritizer.prioritizeEmails(contacts.emails),
      phones: this.prioritizer.prioritizePhones(contacts.phones),
      sourcesChecked: contacts.sourcesChecked,
      url: contacts.websites[0] || '',
      updated_at: new Date().toISOString()
    };
  }

  /** Сохраняет результат в Redis */
  private async saveResult(inn: string, batchId: string | undefined, result: EnrichmentResult): Promise<void> {
    await redisClient.hset(`contacts:status:${inn}`, { status: 'completed', data: JSON.stringify(result) });
    if (batchId) {
      await redisClient.hset(`batch:${batchId}:inn_status`, inn, 'completed');
      await redisClient.expire(`batch:${batchId}:inn_status`, BATCH_TTL_SEC);
    }
    const errorsCount = result.sourcesChecked.filter(s => s.status === 'error').length;
    const msg = result.emails.length === 0 && result.phones.length === 0
      ? `Found 0 contacts. Stages with errors: ${errorsCount}`
      : `Found ${result.emails.length} emails, ${result.phones.length} phones. Stages with errors: ${errorsCount}`;
    console.log(`[Waterfall] Done ${inn}. ${msg}`);
  }

  /** Обрабатывает ошибку обогащения */
  private async handleError(inn: string, batchId: string | undefined, err: Error): Promise<void> {
    console.error(`[Waterfall] Error ${inn}:`, err);
    await redisClient.hset(`contacts:status:${inn}`, { status: 'error', error: err.message });
    if (batchId) {
      await redisClient.hset(`batch:${batchId}:inn_status`, inn, 'error');
      await redisClient.expire(`batch:${batchId}:inn_status`, BATCH_TTL_SEC);
    }
  }
}
