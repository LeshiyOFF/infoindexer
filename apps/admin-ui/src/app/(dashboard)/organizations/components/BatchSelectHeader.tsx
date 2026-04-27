"use client";

import { useEffect } from 'react';

interface BatchSelectHeaderProps {
  allPageInBatch: boolean;
  somePageInBatch: boolean;
  pageItems: { inn: string; name: string }[];
  toggleBatchPage: (items: { inn: string; name: string }[], e?: React.SyntheticEvent) => void;
  variant: 'mobile' | 'desktop';
}

export function BatchSelectHeader({
  allPageInBatch,
  somePageInBatch,
  pageItems,
  toggleBatchPage,
  variant
}: BatchSelectHeaderProps) {
  useEffect(() => {
    document.querySelectorAll<HTMLInputElement>('[data-batch-header-checkbox]').forEach((el) => {
      el.checked = allPageInBatch;
      el.indeterminate = somePageInBatch && !allPageInBatch;
    });
  }, [allPageInBatch, somePageInBatch]);

  if (pageItems.length === 0) return null;

  const isMobile = variant === 'mobile';

  return (
    <label
      className={
        isMobile
          ? 'flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors'
          : 'flex items-center justify-center gap-1.5 cursor-pointer select-none'
      }
    >
      <input
        data-batch-header-checkbox
        type="checkbox"
        checked={allPageInBatch}
        onChange={(e) => toggleBatchPage(pageItems, e)}
        className={
          isMobile
            ? 'rounded-lg border-2 border-gray-300 w-5 h-5 accent-gray-800'
            : 'rounded border-2 border-gray-300 w-4 h-4 accent-gray-800'
        }
        aria-label="Выделить все на странице"
      />
      {isMobile ? (
        <span className="text-sm font-bold text-gray-700">
          Добавить организации на странице в очередь обработки контактов
        </span>
      ) : (
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">В батче</span>
      )}
    </label>
  );
}
