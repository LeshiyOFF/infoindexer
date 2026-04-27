/**
 * Factory для создания сервисов
 *
 * @remarks
 * Реализует Dependency Inversion Principle из SOLID.
 * Централизует создание всех сервисов и их зависимостей.
 */

import type { IEnrichmentService, IQueueService } from '../ports';
import { BrowserService } from './browser.service';
import { EmailService } from './email.service';
import { PhoneService } from './phone.service';
import { DuckDuckGoService } from './duckduckgo.service';
import { EnrichmentService } from './enrichment/enrichment.service';
import { ContactPrioritizer } from './contact-prioritizer.service';
import { QueueService } from './queue.service';

/**
 * Factory для создания сервисов обогащения
 *
 * @remarks
 * Управляет зависимостями и жизненным циклом сервисов.
 */
export class ServicesFactory {
  private browser: BrowserService | null = null;
  private email: EmailService | null = null;
  private phone: PhoneService | null = null;
  private ddg: DuckDuckGoService | null = null;
  private prioritizer: ContactPrioritizer | null = null;
  private enrichment: EnrichmentService | null = null;
  private queue: QueueService | null = null;

  /**
   * Создаёт или возвращает существующий сервис браузера
   */
  createBrowser(): BrowserService {
    if (!this.browser) {
      this.browser = new BrowserService();
    }
    return this.browser;
  }

  /**
   * Создаёт или возвращает существующий сервис email
   */
  createEmail(): EmailService {
    if (!this.email) {
      this.email = new EmailService();
    }
    return this.email;
  }

  /**
   * Создаёт или возвращает существующий сервис телефона
   */
  createPhone(): PhoneService {
    if (!this.phone) {
      this.phone = new PhoneService();
    }
    return this.phone;
  }

  /**
   * Создаёт или возвращает существующий сервис DDG
   */
  createDuckDuckGo(): DuckDuckGoService {
    if (!this.ddg) {
      const email = this.createEmail();
      const phone = this.createPhone();
      this.ddg = new DuckDuckGoService(email, phone);
    }
    return this.ddg;
  }

  /**
   * Создаёт или возвращает существующий приоритизатор
   */
  createPrioritizer(): ContactPrioritizer {
    if (!this.prioritizer) {
      const email = this.createEmail();
      const phone = this.createPhone();
      this.prioritizer = new ContactPrioritizer(email, phone);
    }
    return this.prioritizer;
  }

  /**
   * Создаёт или возвращает существующий сервис обогащения
   */
  createEnrichment(): IEnrichmentService {
    if (!this.enrichment) {
      const browser = this.createBrowser();
      const ddg = this.createDuckDuckGo();
      const email = this.createEmail();
      const phone = this.createPhone();
      const prioritizer = this.createPrioritizer();
      this.enrichment = new EnrichmentService(browser, ddg, email, phone, prioritizer);
    }
    return this.enrichment;
  }

  /**
   * Создаёт или возвращает существующий сервис очереди
   */
  createQueue(): IQueueService {
    if (!this.queue) {
      const enrichment = this.createEnrichment();
      this.queue = new QueueService(enrichment);
    }
    return this.queue;
  }

  /**
   * Закрывает все ресурсы
   */
  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
