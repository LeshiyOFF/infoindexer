"use client";

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface DownloadDatasetsModalProps {
  open: boolean;
  notDownloadedYears: number[];
  selectedYears: Set<number>;
  downloadInProgress: boolean;
  onToggleYear: (year: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onClose: () => void;
  onDownload: () => void;
}

export function DownloadDatasetsModal({
  open,
  notDownloadedYears,
  selectedYears,
  downloadInProgress,
  onToggleYear,
  onSelectAll,
  onClearSelection,
  onClose,
  onDownload
}: DownloadDatasetsModalProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => !downloadInProgress && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Выберите наборы для скачивания</h3>
          <button onClick={() => !downloadInProgress && onClose()} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Показаны только ещё не скачанные годовые наборы.</p>
        {notDownloadedYears.length === 0 ? (
          <p className="text-sm text-gray-600 py-4">Все наборы уже скачаны.</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={onSelectAll} className="text-xs font-bold text-gray-600 hover:text-black">
                Выбрать все
              </button>
              <button onClick={onClearSelection} className="text-xs font-bold text-gray-600 hover:text-black">
                Сбросить
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-auto mb-6">
              {notDownloadedYears.map((year) => (
                <label key={year} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedYears.has(year)}
                    onChange={() => onToggleYear(year)}
                    className="accent-black rounded"
                  />
                  <span className="text-sm font-bold text-gray-800">{year}</span>
                </label>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={() => !downloadInProgress && onClose()} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black">
            Отмена
          </button>
          <button
            onClick={onDownload}
            disabled={selectedYears.size === 0 || downloadInProgress}
            className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {downloadInProgress ? 'Загрузка...' : `Скачать (${selectedYears.size})`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
