export interface CompanyMeta {
  inn: string;
  name: string;
  director: string | null;
  status: string;
  address: string;
  founders: string[];
  updated_at?: string;
  // Поля, добавляемые при поиске
  ogrn?: string;
  region?: string;
  latest_year?: number;
  records_count?: number;
  lon?: string;
  lat?: string;
  revenue?: number;
  net_profit?: number;
  charter_capital?: number;
  age?: number;
  okved?: string;
}

export interface FinancialReport {
  inn: string;
  year: number;
  ogrn?: string;
  region?: string;
  // Финансовые показатели (динамические из Parquet)
  [key: string]: string | number | undefined;
}

export interface SyncState {
  status: 'idle' | 'running' | 'completed' | 'error';
  percentage: number;
  rows_processed?: number;
  message?: string;
  error?: string;
  completed_at?: string;
}

export interface SyncStartPayload {
  year: number;
}

export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Legacy API Response для Organization Service
 * @deprecated Используйте ApiResponse из api/responses.ts
 */
export interface LegacyApiResponse<T> {
  data: T;
  pagination?: ApiPagination;
  error?: string;
}

// Алиас для обратной совместимости
export type ApiResponse<T> = LegacyApiResponse<T>;
