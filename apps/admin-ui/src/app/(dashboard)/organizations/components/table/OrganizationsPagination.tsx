/**
 * Pagination компонент для таблицы
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только пагинация.
 * ISP: зависит только от IPaginationPort.
 */

"use client";

import { memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { IPaginationPort } from '../../domain/ports/table-ports';

export type OrganizationsPaginationProps = IPaginationPort

export const OrganizationsPagination = memo(function OrganizationsPagination({
  page,
  totalPages,
  goToPage,
  canGoNext,
  canGoPrev
}: OrganizationsPaginationProps) {
  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    goToPage((p) => Math.max(1, p - 1));
  }, [goToPage]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    goToPage((p) => p + 1);
  }, [goToPage]);

  return (
    <div className="px-6 py-4 border-t-2 border-gray-300 flex items-center justify-between bg-gray-50/50">
      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
        Страница {page} из {totalPages || 1}
      </span>
      <div className="flex gap-2">
        <PaginationButton
          onClick={handlePrev}
          disabled={!canGoPrev}
          icon={<ChevronLeft className="w-4 h-4" />}
          ariaLabel="Предыдущая страница"
        />
        <PaginationButton
          onClick={handleNext}
          disabled={!canGoNext}
          icon={<ChevronRight className="w-4 h-4" />}
          ariaLabel="Следующая страница"
        />
      </div>
    </div>
  );
});

interface PaginationButtonProps {
  readonly onClick: (e: React.MouseEvent) => void;
  readonly disabled: boolean;
  readonly icon: React.ReactNode;
  readonly ariaLabel: string;
}

const PaginationButton = memo(function PaginationButton({
  onClick,
  disabled,
  icon,
  ariaLabel
}: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 border-2 border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
});
