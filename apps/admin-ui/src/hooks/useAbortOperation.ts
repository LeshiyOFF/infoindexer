/**
 * Hook для отмены операций
 *
 * @remarks
 * Переиспользуемый hook для abort операций с обработкой ошибок.
 */

import { useState, useCallback } from 'react';
import { getAuthHeaders } from '@/lib/api';

export interface AbortOptions {
  readonly onSuccess?: () => void;
  readonly onError?: (error: string) => void;
  readonly body?: Record<string, unknown>;
}

export interface UseAbortOperationReturn {
  readonly isAborting: boolean;
  readonly abortError: string | null;
  abortOperation: (endpoint: string, options?: AbortOptions) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook для отмены операций
 */
export function useAbortOperation(): UseAbortOperationReturn {
  const [isAborting, setIsAborting] = useState(false);
  const [abortError, setAbortError] = useState<string | null>(null);

  const abortOperation = useCallback(async (
    endpoint: string,
    options: AbortOptions = {}
  ): Promise<void> => {
    setIsAborting(true);
    setAbortError(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (res.status === 401) {
        const error = 'Ошибка авторизации';
        setAbortError(error);
        options.onError?.(error);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        const error = data.error || data.message || 'Не удалось отменить операцию';
        setAbortError(error);
        options.onError?.(error);
        return;
      }

      options.onSuccess?.();
    } catch {
      const error = 'Не удалось отправить запрос отмены';
      setAbortError(error);
      options.onError?.(error);
    } finally {
      setIsAborting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setAbortError(null);
  }, []);

  return {
    isAborting,
    abortError,
    abortOperation,
    clearError
  };
}

/**
 * Специализированные hooks для каждого типа операции
 */

export function useAbortFinancialReport(): (year: number) => Promise<void> {
  const { abortOperation } = useAbortOperation();

  return useCallback(async (year: number) => {
    await abortOperation('/api/sync/abort', { body: { year } });
  }, [abortOperation]);
}

export function useAbortEgrul(): () => Promise<void> {
  const { abortOperation } = useAbortOperation();

  return useCallback(async () => {
    await abortOperation('/api/sync/egrul/abort');
  }, [abortOperation]);
}

export function useAbortSanctions(): () => Promise<void> {
  const { abortOperation } = useAbortOperation();

  return useCallback(async () => {
    await abortOperation('/api/sync/sanctions/abort');
  }, [abortOperation]);
}

export function useAbortSummary(): () => Promise<void> {
  const { abortOperation } = useAbortOperation();

  return useCallback(async () => {
    await abortOperation('/api/refresh-summary/abort');
  }, [abortOperation]);
}
