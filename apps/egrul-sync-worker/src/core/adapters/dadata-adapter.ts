import axios from 'axios';

/**
 * Результат поиска по ИНН от DaData
 */
export interface DaDataInnLookupResult {
  inn: string;
  fio: string | null;
  type: 'PERSON' | 'COMPANY' | null;
  raw: unknown;
}

/**
 * Адаптер для DaData API
 */
export class DaDataAdapter {
  private readonly baseUrl = 'https://suggestions.googleapis.com/suggests/api/4_1/rs';

  constructor(
    private readonly apiKey: string,
    private readonly timeout = 5000
  ) {
    if (!apiKey) {
      throw new Error('DaData API key is required');
    }
  }

  /**
   * Ищет информацию по ИНН физического лица
   */
  async lookupPersonByInn(inn: string): Promise<DaDataInnLookupResult | null> {
    if (!inn || !this.isValidInn(inn)) {
      return null;
    }

    try {
      const data = await this.fetchInnData(inn);
      return this.parseInnData(data, inn);
    } catch (error) {
      this.handleRequestError(error, inn);
      return null;
    }
  }

  /**
   * Пакетный поиск по нескольким ИНН
   */
  async lookupMultipleInns(
    inns: string[],
    batchSize = 5
  ): Promise<Map<string, DaDataInnLookupResult>> {
    const results = new Map<string, DaDataInnLookupResult>();

    for (let i = 0; i < inns.length; i += batchSize) {
      const batch = inns.slice(i, i + batchSize);
      const promises = batch.map((inn) => this.lookupPersonByInn(inn));

      try {
        const batchResults = await Promise.all(promises);

        for (let j = 0; j < batch.length; j++) {
          const result = batchResults[j];
          if (result) {
            results.set(batch[j], result);
          }
        }
      } catch {
        continue;
      }

      if (i + batchSize < inns.length) {
        await this.sleep(100);
      }
    }

    return results;
  }

  /**
   * Выполняет HTTP запрос к DaData API
   */
  private async fetchInnData(inn: string): Promise<unknown> {
    const response = await axios.post(
      `${this.baseUrl}/findById/fns`,
      { query: inn, count: 1 },
      {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Парсит ответ от DaData
   */
  private parseInnData(data: unknown, fallbackInn: string): DaDataInnLookupResult | null {
    const suggestions = (data as { suggestions?: unknown[] })?.suggestions;
    if (!suggestions || suggestions.length === 0) {
      return null;
    }

    const first = suggestions[0] as { data?: { type?: string; inn?: string } };
    const record = first.data;

    if (!record) {
      return null;
    }

    const isPerson = record.type === 'INDIVIDUAL' || record.type === 'INDIVIDUAL_ENTREPRENEUR';

    if (!isPerson) {
      return null;
    }

    return {
      inn: record.inn || fallbackInn,
      fio: this.extractFio(record),
      type: 'PERSON',
      raw: record
    };
  }

  /**
   * Извлекает ФИО из данных DaData
   */
  private extractFio(data: unknown): string | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const d = data as Record<string, unknown>;

    if (typeof d.name === 'string' && d.name) {
      return d.name;
    }

    if (typeof d.fio === 'object' && d.fio) {
      const fio = d.fio as Record<string, string | undefined>;
      const parts = [fio.surname, fio.name, fio.patronymic].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(' ');
      }
    }

    if (typeof d.unrestricted_value === 'string' && d.unrestricted_value) {
      return d.unrestricted_value;
    }

    return null;
  }

  /**
   * Проверяет валидность ИНН
   */
  private isValidInn(inn: string): boolean {
    const digits = inn.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 12;
  }

  /**
   * Обрабатывает ошибки HTTP запроса
   */
  private handleRequestError(error: unknown, inn: string): void {
    if (!axios.isAxiosError(error)) {
      return;
    }

    const status = error.response?.status;

    if (status === 401) {
      console.error('DaData API: Unauthorized - check API key');
    } else if (status === 402) {
      console.error('DaData API: Payment required - check balance');
    } else if (error.code === 'ECONNABORTED') {
      console.warn(`DaData API timeout for INN ${inn}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
