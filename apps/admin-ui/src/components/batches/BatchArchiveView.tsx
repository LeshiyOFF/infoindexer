/**
 * View для архива батча
 *
 * @remarks
 * Отображает детали архива с компаниями и результатами.
 */

"use client";

import { memo, useCallback, useState } from 'react';
import { ArrowLeft, DownloadCloud, RotateCcw, Menu, X } from 'lucide-react';
import { useBatchArchive } from '@/hooks/useBatchArchive';
import { CompaniesPanel } from './CompaniesPanel';
import { BatchResultsFeed } from './BatchResultsFeed';

export interface BatchArchiveViewProps {
  readonly batchId: string;
  readonly onBackToHistory: () => void;
}

export const BatchArchiveView = memo(function BatchArchiveView({
  batchId,
  onBackToHistory
}: BatchArchiveViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInn, setSelectedInn] = useState<string | null>(null);
  const [rerunning, setRerunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { meta, results, loading, handleExport: exportBatch, handleRerun: rerunBatch } = useBatchArchive(batchId);

  const handleRerun = useCallback(async () => {
    setRerunning(true);
    try { await rerunBatch(); onBackToHistory(); window.location.href = '/batches'; }
    catch (e) { alert(e instanceof Error ? e.message : 'Ошибка'); }
    finally { setRerunning(false); }
  }, [rerunBatch, onBackToHistory]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try { await exportBatch(); }
    finally { setExporting(false); }
  }, [exportBatch]);

  if (loading) return <div className="flex items-center justify-center py-16"><p className="text-gray-500">Загрузка архива...</p></div>;
  if (!meta) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <p className="text-gray-500 text-center">Батч не найден</p>
      <button onClick={onBackToHistory} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200">
        <ArrowLeft className="w-4 h-4" />Вернуться к истории
      </button>
    </div>
  );

  const companiesPanel = <CompaniesPanel companies={meta.inns} selectedInn={selectedInn} onSelect={setSelectedInn} onClearSelection={() => setSelectedInn(null)} mobile />;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed left-0 top-14 right-0 bottom-0 bg-black/40 z-50 lg:hidden backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="fixed left-0 top-14 bottom-0 w-[min(320px,85vw)] z-50 lg:hidden bg-white border-r border-gray-200 shadow-xl overflow-auto">
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase text-gray-600">Компании</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">{companiesPanel}</div>
          </div>
        </>
      )}

      {/* Header */}
      <header className="shrink-0 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 flex-wrap">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-gray-100"><Menu className="w-5 h-5" /></button>
          <button onClick={onBackToHistory} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Вернуться к истории</span></button>
          <span className="text-base sm:text-lg font-bold text-gray-900 truncate">Архив: <span className="font-mono text-gray-700">{batchId}</span></span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleRerun} disabled={rerunning} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-black text-white font-bold text-xs hover:bg-gray-800 disabled:opacity-50"><RotateCcw className="w-4 h-4" />{rerunning ? 'Запуск...' : 'Повторить'}</button>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs disabled:opacity-50"><DownloadCloud className="w-4 h-4" />{exporting ? 'Экспорт...' : 'Экспорт'}</button>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-0 overflow-hidden pt-6">
        <div className="hidden lg:flex lg:w-1/3 flex-col">{<CompaniesPanel companies={meta.inns} selectedInn={selectedInn} onSelect={setSelectedInn} onClearSelection={() => setSelectedInn(null)} />}</div>
        <BatchResultsFeed isArchive batchId={batchId} archiveResults={results?.results ?? null} archiveInns={meta.inns} selectedCompanyInn={selectedInn} />
      </div>
    </div>
  );
});
