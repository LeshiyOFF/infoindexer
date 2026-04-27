/**
 * Sanction Parser Service Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { SanctionParserService } from '../sanction-parser.service';
import { SanctionParseErrorCode } from '../sanction-parse-error';
import type { SanctionSourceData } from '../sanction-parser.service';

describe('SanctionParserService', () => {
  const parser = new SanctionParserService();

  const validSource: SanctionSourceData = {
    id: '123',
    inn: '7727771492',
    program: 'EU Sanctions',
    program_id: 'EU-001',
    authority: 'European Union',
    country: 'EU',
    start_date: '2024-01-01',
    end_date: null,
    source_url: 'https://example.com/sanction'
  };

  const expectErrorCode = (result: ReturnType<typeof parser.parse>, code: SanctionParseErrorCode) => {
    expect(result.isErr()).toBe(true);
    result.match({
      ok: () => {
        throw new Error('Should not be ok');
      },
      err: (error) => {
        expect(error.code).toBe(code);
      }
    });
  };

  describe('parse — валидация данных', () => {
    it('парсит валидные данные', () => {
      const result = parser.parse(validSource);
      expect(result.isOk()).toBe(true);

      result.match({
        ok: (row) => {
          expect(row.id).toBe('123');
          expect(row.inn).toBe('7727771492');
          expect(row.program).toBe('EU Sanctions');
          expect(row.start_date).toBeInstanceOf(Date);
          expect(row.end_date).toBeNull();
        },
        err: () => {
          throw new Error('Should not be error');
        }
      });
    });

    it('ошибка при пустом id', () => {
      expectErrorCode(parser.parse({ ...validSource, id: '' }), SanctionParseErrorCode.MISSING_REQUIRED_FIELD);
    });

    it('ошибка при пустом inn', () => {
      expectErrorCode(parser.parse({ ...validSource, inn: '' }), SanctionParseErrorCode.MISSING_REQUIRED_FIELD);
    });

    it('ошибка при неверном формате ИНН', () => {
      expectErrorCode(parser.parse({ ...validSource, inn: '123' }), SanctionParseErrorCode.INVALID_INN_FORMAT);
    });

    it('принимает ИНН из 10 цифр', () => {
      const result = parser.parse({ ...validSource, inn: '1234567890' });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.unwrap().inn).toBe('1234567890');
    });

    it('принимает ИНН из 12 цифр', () => {
      const result = parser.parse({ ...validSource, inn: '123456789012' });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.unwrap().inn).toBe('123456789012');
    });

    it('ошибка при пустой программе', () => {
      expectErrorCode(parser.parse({ ...validSource, program: '' }), SanctionParseErrorCode.EMPTY_PROGRAM);
    });

    it('ошибка при пустом органе', () => {
      expectErrorCode(parser.parse({ ...validSource, authority: '' }), SanctionParseErrorCode.EMPTY_AUTHORITY);
    });

    it('ошибка при неверном формате даты начала', () => {
      expectErrorCode(parser.parse({ ...validSource, start_date: 'invalid' }), SanctionParseErrorCode.INVALID_DATE_FORMAT);
    });

    it('парсит дату окончания', () => {
      const result = parser.parse({ ...validSource, end_date: '2025-12-31' });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.unwrap().end_date).toBeInstanceOf(Date);
    });

    it('ошибка при неверном формате даты окончания', () => {
      expectErrorCode(parser.parse({ ...validSource, end_date: 'invalid' }), SanctionParseErrorCode.INVALID_DATE_FORMAT);
    });

    it('ошибка при неверном URL', () => {
      expectErrorCode(parser.parse({ ...validSource, source_url: 'not-url' }), SanctionParseErrorCode.INVALID_URL_FORMAT);
    });
  });

  describe('parseBatch', () => {
    it('парсит батч валидных данных', () => {
      const sources: SanctionSourceData[] = [
        { ...validSource, id: '1' },
        { ...validSource, id: '2' },
        { ...validSource, id: '3' }
      ];

      const results = parser.parseBatch(sources);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.isOk())).toBe(true);
    });

    it('возвращает смешанные результаты', () => {
      const sources: SanctionSourceData[] = [
        { ...validSource, id: '1' },
        { ...validSource, id: '', inn: '' },
        { ...validSource, id: '3' }
      ];

      const results = parser.parseBatch(sources);

      expect(results).toHaveLength(3);
      expect(results[0].isOk()).toBe(true);
      expect(results[1].isErr()).toBe(true);
      expect(results[2].isOk()).toBe(true);
    });
  });

  describe('логирование', () => {
    it('логирует ошибки парсинга', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      parser.parse({ ...validSource, id: '' });

      expect(consoleSpy).toHaveBeenCalledWith('[SanctionParser] Missing required field: id');
      consoleSpy.mockRestore();
    });
  });
});
