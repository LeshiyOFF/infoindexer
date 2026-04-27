"use client";

import { createPortal } from 'react-dom';
import { X, RefreshCw, Trash2 } from 'lucide-react';

export interface ManageDatasetsModalProps {
  open: boolean;
  yearsForDeletion: number[];
  selectedYearsToDelete: Set<number>;
  deleteInProgress: boolean;
  onToggleYear: (year: number) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function ManageDatasetsModal({
  open,
  yearsForDeletion,
  selectedYearsToDelete,
  deleteInProgress,
  onToggleYear,
  onClose,
  onDelete
}: ManageDatasetsModalProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => !deleteInProgress && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Управление наборами</h3>
          <button onClick={() => !deleteInProgress && onClose()} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Выберите наборы для удаления. Загрузки в процессе будут отменены.</p>
        {yearsForDeletion.length === 0 ? (
          <p className="text-sm text-gray-600 py-4">Нет скачанных или загружающихся наборов.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-auto mb-6">
            {yearsForDeletion.map((year) => (
              <label key={year} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedYearsToDelete.has(year)}
                  onChange={() => onToggleYear(year)}
                  className="accent-black rounded"
                />
                <span className="text-sm font-bold text-gray-800">{year}</span>
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={() => !deleteInProgress && onClose()} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black">
            Закрыть
          </button>
          <button
            onClick={onDelete}
            disabled={selectedYearsToDelete.size === 0 || deleteInProgress}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {deleteInProgress ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleteInProgress ? 'Удаление...' : `Удалить (${selectedYearsToDelete.size})`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
