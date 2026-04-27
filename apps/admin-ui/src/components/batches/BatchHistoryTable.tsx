/**
 * Table для истории батчей
 *
 * @remarks
 * Отображает историю батчей с пагинацией.
 */

"use client";

import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBatchHistory } from '@/hooks/useBatchHistory';
import { BatchStatusBadge, BatchProgressBar } from './index';
import type { BatchHistoryItem } from './ports';

export interface BatchHistoryTableProps {
  readonly onGoToArchive: (batchId: string) => void;
  readonly refreshTrigger?: number;
}

const MobileHistoryCard = memo(function MobileHistoryCard({ item, onGoToArchive }: { readonly item: BatchHistoryItem; readonly onGoToArchive: (id: string) => void }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-gray-100/50 border border-gray-200 shadow-md hover:shadow-xl hover:border-gray-300 transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm font-bold text-gray-900 truncate">{item.batchId}</span>
          <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('ru-RU')}</span>
        </div>
        <BatchProgressBar completed={item.completedCount} total={item.totalCount} />
        <div className="flex items-center justify-between gap-4 pt-2">
          <BatchStatusBadge status={item.status} />
          <button onClick={() => onGoToArchive(item.batchId)} className="flex items-center gap-2 min-h-12 px-4 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 text-sm font-bold">
            Перейти<ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

const Pagination = memo(function Pagination({ page, totalPages, total, onPageChange }: { readonly page: number; readonly totalPages: number; readonly total: number; readonly onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50">
        <ChevronLeft className="w-4 h-4" />Назад
      </button>
      <span className="text-sm text-gray-600">Страница <strong>{page}</strong> из <strong>{totalPages}</strong>{total > 0 && <span className="ml-2 text-gray-500">({total} всего)</span>}</span>
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50">
        Вперёд<ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});

const DesktopTableRow = memo(function DesktopTableRow({ item, onGoToArchive }: { readonly item: BatchHistoryItem; readonly onGoToArchive: (id: string) => void }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-all">
      <td className="px-6 py-4"><span className="font-mono text-sm font-bold text-gray-800">{item.batchId}</span></td>
      <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.createdAt).toLocaleString('ru-RU')}</td>
      <td className="px-6 py-4"><BatchProgressBar completed={item.completedCount} total={item.totalCount} /></td>
      <td className="px-6 py-4"><BatchStatusBadge status={item.status} /></td>
      <td className="px-6 py-4">
        <button onClick={() => onGoToArchive(item.batchId)} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-800 hover:text-white text-sm font-bold">
          Перейти<ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

export const BatchHistoryTable = memo(function BatchHistoryTable({ onGoToArchive, refreshTrigger = 0 }: BatchHistoryTableProps) {
  const { items, loading, page, total, totalPages, setPage } = useBatchHistory(refreshTrigger);

  if (loading) return <div className="flex items-center justify-center py-16"><p className="text-gray-500">Загрузка истории...</p></div>;
  if (items.length === 0) return <div className="flex flex-col items-center justify-center py-16"><p className="text-gray-500">Нет завершённых батчей</p></div>;

  return (
    <div className="rounded-2xl lg:rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      {/* Mobile */}
      <div className="lg:hidden p-4 space-y-4">{items.map(item => <MobileHistoryCard key={item.batchId} item={item} onGoToArchive={onGoToArchive} />)}</div>
      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">ID операции</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Дата</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Прогресс</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Статус</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 w-28">Действие</th>
            </tr>
          </thead>
          <tbody>{items.map(item => <DesktopTableRow key={item.batchId} item={item} onGoToArchive={onGoToArchive} />)}</tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
});
