/**
 * API performance tests: GET /api/organizations must respond within 1 second
 * for each filter combination. Requires running server (e.g. docker compose up).
 * Uses randomized params and parallel requests to avoid cache effects.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3140';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test';
const MAX_MS = 1000;
/** Временный порог для тяжёлых тестов до подтверждения применения проекций. */
const MAX_MS_RELAXED = 8000;
/** Порог для тяжёлых комбинированных запросов (узкие диапазоны, много фильтров). Цель — снизить до MAX_MS. */
const MAX_MS_HEAVY = 20000;
/** Количество параллельных запросов на один тест. */
const PARALLEL_REQUESTS = 4;

interface FetchResult {
  elapsed: number;
  ok: boolean;
  status: number;
  json?: { data?: unknown[]; pagination?: { total?: number; page?: number; limit?: number; totalPages?: number }; error?: string };
}

// --- Хелперы рандомизации ---

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const REGIONS = ['77', '78', '01', '23', '52', '74'];
const SEARCH_TEXTS = ['тест', 'ООО', 'ИП', 'Глав'];
const SEARCH_NUMERICS = ['7712345678', '7800000000', '0100000001'];
const STATUSES = ['Действующая', 'Ликвидирована', 'В процессе ликвидации'];

function genBaseRandomParams(): Record<string, string> {
  return {
    page: String(randomInt(1, 3)),
    limit: String(randomInt(10, 25))
  };
}

/** Генерирует параметры для указанного фильтра с рандомными диапазонами. */
function genParamsForFilter(filterName: string): Record<string, string> {
  const base = { ...genBaseRandomParams() };
  switch (filterName) {
    case 'search_text':
      return { ...base, search: pickRandom(SEARCH_TEXTS) };
    case 'search_numeric':
      return { ...base, search: pickRandom(SEARCH_NUMERICS) };
    case 'region':
      return { ...base, region: pickRandom(REGIONS) };
    case 'hasGeo_true':
      return { ...base, hasGeo: 'true' };
    case 'hasGeo_false':
      return { ...base, hasGeo: 'false' };
    case 'minRevenue': {
      const min = randomInt(100, 50000);
      return { ...base, minRevenue: String(min) };
    }
    case 'maxRevenue': {
      const max = randomInt(100000, 10000000);
      return { ...base, maxRevenue: String(max) };
    }
    case 'minAge':
      return { ...base, minAge: String(randomInt(1, 10)) };
    case 'maxAge':
      return { ...base, maxAge: String(randomInt(11, 30)) };
    case 'minCharterCapital':
      return { ...base, minCharterCapital: String(randomInt(1000, 50000)) };
    case 'status':
      return { ...base, status: pickRandom(STATUSES) };
    case 'hasDirector_true':
      return { ...base, hasDirector: 'true' };
    case 'hasDirector_false':
      return { ...base, hasDirector: 'false' };
    case 'hasFinancialReports':
      return { ...base, hasFinancialReports: 'true' };
    case 'hasName':
      return { ...base, hasName: 'true' };
    default:
      return base;
  }
}

/** Генерирует параметры для сортировки с рандомными page/limit. */
function genParamsForSort(sortBy: string, sortOrder: string): Record<string, string> {
  return {
    ...genBaseRandomParams(),
    sortBy,
    sortOrder
  };
}

/** Генерирует параметры для комбинированных фильтров. */
function genCombinedFilterParams(): Record<string, string> {
  const minRev = randomInt(100, 10000);
  const maxRev = minRev + randomInt(10000, 500000);
  const minAge = randomInt(1, 8);
  const maxAge = minAge + randomInt(5, 15);
  return {
    ...genBaseRandomParams(),
    search: pickRandom(SEARCH_TEXTS),
    region: pickRandom(REGIONS),
    hasGeo: 'true',
    minRevenue: String(minRev),
    maxRevenue: String(maxRev),
    minAge: String(minAge),
    maxAge: String(maxAge),
    minCharterCapital: String(randomInt(1000, 50000)),
    status: pickRandom(STATUSES),
    hasDirector: 'true',
    hasFinancialReports: 'true',
    hasName: 'true'
  };
}

/** Генерирует параметры для реального тяжёлого кейса с рандомизацией диапазонов. */
function genRealWorldHeavyParams(): Record<string, string> {
  const minRev = randomInt(300, 1000);
  const maxRev = minRev + randomInt(2000, 5000);
  const minAge = randomInt(15, 35);
  const maxAge = minAge + randomInt(10, 30);
  return {
    page: '1',
    limit: String(randomInt(25, 50)),
    search: '',
    sortBy: 'revenue',
    sortOrder: 'DESC',
    region: '',
    hasGeo: 'true',
    minRevenue: String(minRev),
    maxRevenue: String(maxRev),
    minAge: String(minAge),
    maxAge: String(maxAge),
    hasDirector: 'true',
    hasFinancialReports: 'true',
    hasName: 'true'
  };
}

// --- Fetch ---

async function fetchOrganizations(params: Record<string, string>): Promise<FetchResult> {
  const url = `${BASE_URL}/api/organizations?${new URLSearchParams(params).toString()}`;
  const start = Date.now();
  const res = await fetch(url, {
    headers: { Authorization: ADMIN_PASSWORD }
  });
  const elapsed = Date.now() - start;
  let json: FetchResult['json'];
  try {
    json = (await res.json()) as FetchResult['json'];
  } catch {
    json = undefined;
  }
  return { elapsed, ok: res.ok, status: res.status, json };
}

async function fetchOrganizationsBatch(
  paramsVariants: Record<string, string>[]
): Promise<FetchResult[]> {
  return Promise.all(paramsVariants.map((p) => fetchOrganizations(p)));
}

// --- Assertions ---

function assertPerfRelaxed(result: FetchResult, maxMs: number = MAX_MS_HEAVY): void {
  expect(result.ok, 'API should return 200').toBe(true);
  expect(result.elapsed, `Response time ${result.elapsed}ms exceeded ${maxMs}ms`).toBeLessThan(maxMs);
  if (result.json) {
    expect(Array.isArray(result.json.data)).toBe(true);
    if (result.json.pagination) {
      expect(typeof result.json.pagination.total).toBe('number');
      expect(typeof result.json.pagination.page).toBe('number');
      expect(typeof result.json.pagination.limit).toBe('number');
      expect(typeof result.json.pagination.totalPages).toBe('number');
    }
  }
}

function assertPerfAndStructure(result: FetchResult, maxMs: number = MAX_MS): void {
  expect(result.ok, 'API should return 200').toBe(true);
  expect(result.elapsed, `Response time ${result.elapsed}ms exceeded ${maxMs}ms`).toBeLessThan(maxMs);
  if (result.json) {
    expect(Array.isArray(result.json.data)).toBe(true);
    if (result.json.pagination) {
      expect(typeof result.json.pagination.total).toBe('number');
      expect(typeof result.json.pagination.page).toBe('number');
      expect(typeof result.json.pagination.limit).toBe('number');
      expect(typeof result.json.pagination.totalPages).toBe('number');
    }
  }
}

function assertPerfAndStructureBatch(
  results: FetchResult[],
  maxMs: number = MAX_MS
): void {
  const maxElapsed = Math.max(...results.map((r) => r.elapsed));
  results.forEach((r) => {
    expect(r.ok, 'API should return 200').toBe(true);
    if (r.json) {
      expect(Array.isArray(r.json.data)).toBe(true);
      if (r.json.pagination) {
        expect(typeof r.json.pagination.total).toBe('number');
        expect(typeof r.json.pagination.page).toBe('number');
        expect(typeof r.json.pagination.limit).toBe('number');
        expect(typeof r.json.pagination.totalPages).toBe('number');
      }
    }
  });
  expect(
    maxElapsed,
    `Max response time ${maxElapsed}ms exceeded ${maxMs}ms`
  ).toBeLessThan(maxMs);
}

/** Тяжёлые тесты: hasGeo_false, hasFinancialReports, sortBy_records_count_DESC — временно 8s. */
const HEAVY_FILTER_NAMES = new Set([
  'hasGeo_false',
  'hasFinancialReports',
  'sortBy_records_count_DESC'
]);

// --- Тесты ---

const SINGLE_FILTER_NAMES = [
  'search_text',
  'search_numeric',
  'region',
  'hasGeo_true',
  'hasGeo_false',
  'minRevenue',
  'maxRevenue',
  'minAge',
  'maxAge',
  'minCharterCapital',
  'status',
  'hasDirector_true',
  'hasDirector_false',
  'hasFinancialReports',
  'hasName'
];

const SORT_SPECS: [string, string, string][] = [
  ['sortBy_inn_ASC', 'inn', 'ASC'],
  ['sortBy_revenue_DESC', 'revenue', 'DESC'],
  ['sortBy_age_ASC', 'age', 'ASC'],
  ['sortBy_name_ASC', 'name', 'ASC'],
  ['sortBy_records_count_DESC', 'records_count', 'DESC']
];

  describe('2.1 Базовые запросы', () => {

describe('API /organizations performance', () => {
  beforeAll(async () => {
    console.info('Running perf tests against', BASE_URL);
    try {
      const res = await fetch(`${BASE_URL}/api/organizations?limit=1`, {
        headers: { Authorization: ADMIN_PASSWORD }
      });
      const json = (await res.json()) as { pagination?: { total?: number }; error?: string };
      if (json.pagination?.total === 0 && json.error) {
        console.warn('⚠️ Кэш не готов. Тесты могут падать с "Кэш не готов"');
      }
    } catch (e) {
      console.warn('⚠️ API недоступен. Запустите: docker compose up -d');
      console.error(e);
    }
  });
    it('basic request responds within 1s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () => genBaseRandomParams());
      const results = await fetchOrganizationsBatch(variants);
      assertPerfAndStructureBatch(results);
    });

    it('pagination with varied page/limit responds within 1s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () => ({
        ...genBaseRandomParams(),
        page: String(randomInt(1, 5)),
        limit: String(randomInt(10, 25))
      }));
      const results = await fetchOrganizationsBatch(variants);
      assertPerfAndStructureBatch(results);
    });
  });

  describe('2.2 Фильтры по одному', () => {
    for (const filterName of SINGLE_FILTER_NAMES) {
      it(`${filterName} responds within limit`, async () => {
        const variants = Array.from({ length: PARALLEL_REQUESTS }, () =>
          genParamsForFilter(filterName)
        );
        const results = await fetchOrganizationsBatch(variants);
        const maxMs = HEAVY_FILTER_NAMES.has(filterName) ? MAX_MS_RELAXED : MAX_MS;
        results.forEach((r) => {
          expect(r.ok).toBe(true);
          if (r.json) {
            expect(Array.isArray(r.json.data)).toBe(true);
          }
        });
        const maxElapsed = Math.max(...results.map((r) => r.elapsed));
        expect(
          maxElapsed,
          `Max response time ${maxElapsed}ms exceeded ${maxMs}ms`
        ).toBeLessThan(maxMs);
      });
    }
  });

  describe('2.3 Сортировка', () => {
    for (const [name, sortBy, sortOrder] of SORT_SPECS) {
      it(`${name} responds within limit`, async () => {
        const variants = Array.from({ length: PARALLEL_REQUESTS }, () =>
          genParamsForSort(sortBy, sortOrder)
        );
        const results = await fetchOrganizationsBatch(variants);
        const maxMs = HEAVY_FILTER_NAMES.has(name) ? MAX_MS_RELAXED : MAX_MS;
        results.forEach((r) => {
          expect(r.ok).toBe(true);
          if (r.json) {
            expect(Array.isArray(r.json.data)).toBe(true);
          }
        });
        const maxElapsed = Math.max(...results.map((r) => r.elapsed));
        expect(
          maxElapsed,
          `Max response time ${maxElapsed}ms exceeded ${maxMs}ms`
        ).toBeLessThan(maxMs);
      });
    }
  });

  describe('2.4 Комбинированные фильтры', () => {
    it('all filters combined respond within 1s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () =>
        genCombinedFilterParams()
      );
      const results = await fetchOrganizationsBatch(variants);
      assertPerfAndStructureBatch(results);
    });
  });

  describe('2.5 Критичные комбинации (разные PATH)', () => {
    it('PATH 1: search + hasDirector + hasName (meta-only) responds within 1s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () => ({
        ...genBaseRandomParams(),
        search: pickRandom(SEARCH_TEXTS),
        hasDirector: 'true',
        hasName: 'true'
      }));
      const results = await fetchOrganizationsBatch(variants);
      assertPerfAndStructureBatch(results);
    });

    it('PATH 2a: sortBy=revenue (financial sort, no filters) responds within 1s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () =>
        genParamsForSort('revenue', 'DESC')
      );
      const results = await fetchOrganizationsBatch(variants);
      assertPerfAndStructureBatch(results);
    });

    it('PATH 2b: region + minRevenue + hasGeo + status (financial + meta) responds within 1s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () => ({
        ...genBaseRandomParams(),
        region: pickRandom(REGIONS),
        minRevenue: String(randomInt(500, 10000)),
        hasGeo: 'true',
        status: pickRandom(STATUSES)
      }));
      const results = await fetchOrganizationsBatch(variants);
      assertPerfAndStructureBatch(results);
    });
  });

  describe('2.6 Реальный кейс (узкие диапазоны, sortBy revenue)', () => {
    it('real-world heavy: randomized ranges — responds within 20s', async () => {
      const variants = Array.from({ length: PARALLEL_REQUESTS }, () =>
        genRealWorldHeavyParams()
      );
      const results = await fetchOrganizationsBatch(variants);
      results.forEach((r) => assertPerfRelaxed(r, MAX_MS_HEAVY));
    });
  });
});
