/**
 * Context для управления батчами организаций
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { getAuthHeaders } from '@/lib/api';
import { BATCH_STORAGE_KEY } from '@/lib/batch';
import { useBatchPolling } from '@/hooks/useBatchPolling';
import { BatchFlyAnimation } from '@/components/BatchFlyAnimation';
import type { BatchItem, BatchContextValue } from './batch.types';

const BatchContext = createContext<BatchContextValue | null>(null);

export function useBatch() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatch must be used within BatchProvider');
  return ctx;
}

export function BatchProvider({ children }: { children: ReactNode }) {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const hydrationDone = useRef(false);

  const { batchProgress, setBatchProgress } = useBatchPolling(batchItems, batchProcessing);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  useEffect(() => {
    if (hydrationDone.current) return;
    hydrationDone.current = true;
    try {
      const stored = sessionStorage.getItem(BATCH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BatchItem[];
        if (
          Array.isArray(parsed) &&
          parsed.every((x): x is BatchItem => x && typeof x.inn === 'string' && typeof x.name === 'string')
        ) {
          setBatchItems(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (batchItems.length > 0) {
        sessionStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(batchItems));
      } else {
        sessionStorage.removeItem(BATCH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [batchItems]);

  const [flyState, setFlyState] = useState<{ from: DOMRect } | null>(null);

  const triggerFlyToBatch = useCallback((sourceRect: DOMRect) => {
    setFlyState({ from: sourceRect });
    setTimeout(() => setFlyState(null), 900);
  }, []);

  const toggleBatch = useCallback((inn: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    const wasAdding = !batchItems.some(b => b.inn === inn);
    setBatchItems(prev => {
      const exists = prev.some(b => b.inn === inn);
      if (exists) return prev.filter(b => b.inn !== inn);
      return [...prev, { inn, name }];
    });
    if (wasAdding && btn) triggerFlyToBatch(btn.getBoundingClientRect());
  }, [batchItems, triggerFlyToBatch]);

  const toggleBatchPage = useCallback((items: { inn: string; name: string }[], e?: React.SyntheticEvent) => {
    const validItems = items.filter(x => x.inn);
    if (validItems.length === 0) return;
    const sourceEl = e?.currentTarget as HTMLElement | undefined;
    const willAdd = !validItems.every(x => batchItems.some(b => b.inn === x.inn));
    if (willAdd && sourceEl) triggerFlyToBatch(sourceEl.getBoundingClientRect());
    setBatchItems(prev => {
      const prevSet = new Set(prev.map(b => b.inn));
      const allOnPageInBatch = validItems.every(x => prevSet.has(x.inn));
      if (allOnPageInBatch) {
        return prev.filter(b => !validItems.some(x => x.inn === b.inn));
      }
      const toAdd = validItems.filter(x => !prevSet.has(x.inn));
      return [...prev, ...toAdd];
    });
  }, [batchItems, triggerFlyToBatch]);

  const removeFromBatch = useCallback((inn: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchItems(prev => prev.filter(b => b.inn !== inn));
    setBatchProgress(prev => {
      const next = { ...prev };
      delete next[inn];
      return next;
    });
  }, [setBatchProgress]);

  const clearBatch = useCallback(() => {
    setBatchItems([]);
    setBatchProgress({});
    setBatchProcessing(false);
    setCurrentBatchId(null);
  }, [setBatchProgress]);

  const startBatch = useCallback(async () => {
    if (batchItems.length === 0) return;
    setBatchProcessing(true);
    setBatchProgress(prev => {
      const next = { ...prev };
      batchItems.forEach(b => {
        next[b.inn] = { status: 'running' };
      });
      return next;
    });

    try {
      const createRes = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ inns: batchItems })
      });
      const createJson = (await createRes.json()) as { batchId?: string; error?: string };

      if (!createRes.ok) {
        alert(createJson.error || 'Ошибка создания батча');
        setBatchProcessing(false);
        return;
      }

      const batchId = createJson.batchId;
      if (batchId) setCurrentBatchId(batchId);

      const startRes = await fetch('/api/organizations/batch-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ batchId })
      });
      const startJson = (await startRes.json()) as { error?: string };

      if (!startRes.ok) {
        alert(startJson.error || 'Ошибка запуска batch');
        setBatchProcessing(false);
        return;
      }

      queueMicrotask(() => clearBatch());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сети');
      setBatchProcessing(false);
    }
  }, [batchItems, setBatchProgress, clearBatch]);

  const value: BatchContextValue = {
    batchItems,
    currentBatchId,
    batchProgress,
    batchProcessing,
    overlayOpen,
    toggleBatch,
    toggleBatchPage,
    removeFromBatch,
    startBatch,
    clearBatch,
    openOverlay,
    closeOverlay,
    setOverlayOpen
  };

  return (
    <BatchContext.Provider value={value}>
      {children}
      {flyState && <BatchFlyAnimation from={flyState.from} onComplete={() => setFlyState(null)} />}
    </BatchContext.Provider>
  );
}
