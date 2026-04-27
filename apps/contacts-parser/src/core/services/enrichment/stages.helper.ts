/**
 * Helper для стадий OSINT обогащения
 *
 * @remarks
 * Выносит сложную логику стадий из EnrichmentService.
 * Разбивает God function на управляемые части.
 */

import { redisClient } from 'shared';
import type { Page } from 'playwright';
import type { ContactInfo, SourceStatus } from '../../types/contacts.types';
import type { IDuckDuckGoService } from '../../ports/i-duckduckgo.port';
import type { EmailService } from '../email.service';
import type { PhoneService } from '../phone.service';

/**
 * Helper для выполнения OSINT стадий
 *
 * @remarks
 * Содержит логику поиска по директору и реестрам.
 */
export class EnrichmentStagesHelper {
  constructor(
    private readonly ddg: IDuckDuckGoService,
    private readonly email: EmailService,
    private readonly phone: PhoneService
  ) {}

  /**
   * Выполняет OSINT поиск по директору
   *
   * @param inn - ИНН организации
   * @param page - Экземпляр Page
   * @param contacts - Контейнер для контактов
   * @param directorName - ФИО директора
   * @param companyName - Название компании
   * @param addSource - Колбэк для добавления источника
   */
  async osintDirector(
    inn: string,
    page: Page,
    contacts: ContactInfo,
    directorName: string,
    companyName: string,
    addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void
  ): Promise<void> {
    const stages: Array<{ n: number; label: string; query: string }> = [
      {
        n: 4,
        label: 'ОСИНТ (Директор)',
        query: `"${directorName}" ${companyName ? `"${companyName}"` : ''} телефон email -site:checko.ru -site:rusprofile.ru -site:sbis.ru`
      },
      {
        n: 5,
        label: 'DDG расширенный',
        query: `"${directorName}" email OR телефон -site:checko.ru -site:rusprofile.ru -site:sbis.ru -site:rbc.ru`
      },
      { n: 6, label: 'VK', query: `site:vk.com "${directorName}"` },
      {
        n: 7,
        label: 'LinkedIn',
        query: `site:linkedin.com/in "${directorName}" ${companyName ? `"${companyName}"` : ''}`
      },
      { n: 8, label: 'Telegram', query: `"${directorName}" telegram OR t.me` },
      { n: 9, label: 'Госзакупки', query: `site:zakupki.gov.ru "${directorName}"` },
      { n: 10, label: 'HH.ru', query: `site:hh.ru "${directorName}" директор` },
      { n: 11, label: 'Executive.ru', query: `site:executive.ru "${directorName}"` },
      { n: 12, label: 'Rating.gd.ru', query: `site:rating.gd.ru "${directorName}"` },
      { n: 13, label: 'Конференции', query: `"${directorName}" конференция спикер контакт` },
      { n: 14, label: 'Судебные реестры', query: `site:kad.arbitr.ru OR site:sudact.ru "${directorName}"` },
      { n: 15, label: 'Реестр АУ', query: `site:fedresurs.ru OR site:tbankrot.ru "${directorName}"` },
      { n: 16, label: 'Habr Career', query: `site:career.habr.com "${directorName}"` },
      {
        n: 17,
        label: 'Ассоциации',
        query: `"${directorName}" ${companyName ? `"${companyName}"` : ''} ассоциация союз член контакт`
      }
    ];

    for (const s of stages) {
      await this.runDirectorStage(inn, page, contacts, s, addSource);
    }
  }

  /**
   * Выполняет одну стадию поиска по директору
   */
  private async runDirectorStage(
    inn: string,
    page: Page,
    contacts: ContactInfo,
    stage: { n: number; label: string; query: string },
    addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void
  ): Promise<void> {
    try {
      console.log(`[Waterfall] ${stage.label}: ...`);
      await redisClient.hset(`contacts:status:${inn}`, {
        status: 'running',
        stage: `${stage.n}/21: ${stage.label}`
      });
      const { emails, phones } = await this.ddg.searchWithTargetVisit(page, stage.query, 5);
      this.email.filterBlocked(emails).forEach(e =>
        contacts.emails.push({ val: e, source: stage.label, type: 'direct' })
      );
      phones.filter(p => this.phone.isValidLength(p)).forEach(p =>
        contacts.phones.push({ val: p, source: stage.label, type: 'direct' })
      );
      addSource(stage.label, emails.length > 0 || phones.length > 0);
    } catch (e) {
      console.error(`[Waterfall] ${stage.label} error:`, e);
      addSource(stage.label, false, 'error');
    }
  }

  /**
   * Ищет в реестрах по ИНН
   *
   * @param inn - ИНН организации
   * @param page - Экземпляр Page
   * @param contacts - Контейнер для контактов
   * @param addSource - Колбэк для добавления источника
   */
  async searchRegistries(
    inn: string,
    page: Page,
    contacts: ContactInfo,
    addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void
  ): Promise<void> {
    const stages: Array<{ label: string; stage: string; query: string }> = [
      {
        label: 'ЕФРСБ',
        stage: '18/21: ЕФРСБ',
        query: `site:bankrot.fedresurs.ru "${inn}" контакты`
      },
      {
        label: 'Росаккредитация',
        stage: '19/21: Росаккредитация',
        query: `site:pub.fsa.gov.ru "${inn}" телефон`
      },
      {
        label: 'Реестр ККТ',
        stage: '21/21: Реестр ККТ',
        query: `"${inn}" регистрация ККТ телефон`
      }
    ];

    for (const s of stages) {
      await this.runRegistryStage(inn, page, contacts, s, addSource);
    }
  }

  /**
   * Выполняет одну стадию поиска в реестрах
   */
  private async runRegistryStage(
    inn: string,
    page: Page,
    contacts: ContactInfo,
    stage: { label: string; stage: string; query: string },
    addSource: (name: string, found: boolean, status?: SourceStatus['status']) => void
  ): Promise<void> {
    try {
      console.log(`[Waterfall] ${stage.label}: ${inn}...`);
      await redisClient.hset(`contacts:status:${inn}`, { status: 'running', stage: stage.stage });
      const { emails, phones } = await this.ddg.searchWithTargetVisit(page, stage.query, 5);
      this.email.filterBlocked(emails).forEach(e =>
        contacts.emails.push({ val: e, source: stage.label, type: 'official' })
      );
      phones.forEach(p => contacts.phones.push({ val: p, source: stage.label, type: 'official' }));
      addSource(stage.label, emails.length > 0 || phones.length > 0);
    } catch (e) {
      console.error(`[Waterfall] ${stage.label} error:`, e);
      addSource(stage.label, false, 'error');
    }
  }

  /**
   * Возвращает список стадий директора для пропуска
   */
  getDirectorStagesLabels(): string[] {
    return [
      'ОСИНТ (Директор)',
      'DDG расширенный',
      'VK',
      'LinkedIn',
      'Telegram',
      'Госзакупки',
      'HH.ru',
      'Executive.ru',
      'Rating.gd.ru',
      'Конференции',
      'Судебные реестры',
      'Реестр АУ',
      'Habr Career',
      'Ассоциации'
    ];
  }
}
