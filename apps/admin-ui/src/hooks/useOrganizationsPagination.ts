/**
 * Hook для управления пагинацией организаций
 *
 * @remarks
 * Отвечает за текущую страницу и навигацию между страницами.
 */

"use client";

import { useCallback, useState, useEffect } from 'react';
import type { PaginationResult } from './useOrganizationsData';

/**
 * Хук для управления пагинацией
 *
 * @param initialTotalPages — начальное общее количество страниц
 * @param onPageChange — callback при изменении страницы
 * @returns Состояние пагинации и функции управления
 */
export function useOrganizationsPagination(initialTotalPages: number, onPageChange: () => void) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  /**
   * Обновляет общее количество страниц
   */
  useEffect(() => {
    setTotalPages(initialTotalPages);
  }, [initialTotalPages]);

  /**
   * Сбрасывает страницу на первую
   */
  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  /**
   * Переходит на указанную страницу
   */
  const goToPage = useCallback(
    (updater: (p: number) => number) => {
      setPage(prev => {
        const next = updater(prev);
        // Проверяем валидность страницы
        if (next < 1) return prev;
        if (totalPages > 0 && next > totalPages) return prev;
        if (next === prev) return prev;
        onPageChange();
        return next;
      });
    },
    [totalPages, onPageChange]
  );

  /**
   * Устанавливает конкретную страницу
   */
  const setPageNumber = useCallback(
    (p: number) => {
      if (p < 1) return;
      if (totalPages > 0 && p > totalPages) return;
      if (p === page) return;
      setPage(p);
      onPageChange();
    },
    [totalPages, page, onPageChange]
  );

  return {
    page,
    totalPages,
    goToPage,
    setPage: setPageNumber,
    resetPage
  };
}

/**
 * Типы для экспорта
 */
export type { PaginationResult };
