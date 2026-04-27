"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BatchActivePanel } from "@/components/batches/BatchActivePanel";
import { BatchHistoryTable } from "@/components/batches/BatchHistoryTable";
import { BatchArchiveView } from "@/components/batches/BatchArchiveView";
import { useBatch } from "@/contexts/BatchContext";

export default function BatchesPage() {
  const searchParams = useSearchParams();
  const { batchItems, currentBatchId } = useBatch();

  const archiveIdFromUrl = searchParams.get("id") || null;

  const [archiveBatchId, setArchiveBatchId] = useState<string | null>(
    archiveIdFromUrl
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const prevBatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    setArchiveBatchId(archiveIdFromUrl);
  }, [archiveIdFromUrl]);

  useEffect(() => {
    if (
      currentBatchId &&
      currentBatchId !== prevBatchIdRef.current
    ) {
      prevBatchIdRef.current = currentBatchId;
      setRefreshTrigger((t) => t + 1);
    }
  }, [currentBatchId]);

  const handleGoToArchive = useCallback((batchId: string) => {
    setArchiveBatchId(batchId);
    window.history.replaceState(null, "", `/batches?id=${batchId}`);
  }, []);

  const handleBackToHistory = useCallback(() => {
    setArchiveBatchId(null);
    window.history.replaceState(null, "", "/batches");
  }, []);

  const renderContent = () => {
    if (archiveBatchId) {
      return (
        <BatchArchiveView
          batchId={archiveBatchId}
          onBackToHistory={handleBackToHistory}
        />
      );
    }

    return (
      <div className="flex flex-col flex-1 min-h-0 gap-6">
        {batchItems.length > 0 && <BatchActivePanel />}

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <BatchHistoryTable
            onGoToArchive={handleGoToArchive}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {!archiveBatchId && (
        <header className="shrink-0 flex items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex-1">
            Очередь обработки контактов
          </h1>
          {batchItems.length > 0 && (
            <span className="text-sm text-gray-600 shrink-0">
              Выбрано:{" "}
              <strong className="font-bold text-gray-900">{batchItems.length}</strong>
            </span>
          )}
        </header>
      )}

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
