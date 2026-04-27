"use client";

import { createPortal } from 'react-dom';
import { X, RefreshCw, Trash2 } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api';

export interface EgrulManageModalProps {
  open: boolean;
  egrulStatus: { status: string; message?: string };
  onClose: () => void;
  onSync: () => void;
  onFetch: () => void;
}

export function EgrulManageModal({ open, egrulStatus, onClose, onSync, onFetch }: EgrulManageModalProps) {
  if (!open || typeof document === 'undefined') return null;

  const handleDelete = async () => {
    if (!confirm('Удалить все данные реестра юрлиц (companies_meta)?')) return;
    try {
      const res = await fetch('/api/sync/egrul/delete', { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error ?? 'Ошибка удаления');
        return;
      }
      onFetch();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка сети');
    }
  };

  return createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Управление реестром ЕГРЮЛ</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Реестр содержит названия компаний, директоров, численность. Обновление перезаписывает данные из дампов ФНС и OfData.
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Статус:{' '}
          {egrulStatus.status === 'completed' ? 'синхронизирован' : egrulStatus.status === 'running' ? egrulStatus.message || 'обработка...' : 'требуется синхронизация'}
        </p>
        <div className="flex justify-end gap-2 flex-wrap">
          <button
            onClick={handleDelete}
            disabled={egrulStatus.status === 'running'}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Удалить реестр
          </button>
          <button
            onClick={() => {
              onSync();
              onClose();
            }}
            disabled={egrulStatus.status === 'running'}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {egrulStatus.status === 'running' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Обновить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
