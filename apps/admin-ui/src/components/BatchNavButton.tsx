"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { useBatch } from "@/contexts/BatchContext";

export function BatchNavButton() {
  const {
    batchItems,
    batchProcessing,
    batchProgress,
    currentBatchId
  } = useBatch();

  const completedCount =
    currentBatchId && batchProcessing
      ? batchItems.filter(b => {
          const p = batchProgress[b.inn];
          return p && (p.status === "completed" || p.status === "error");
        }).length
      : 0;
  const totalCount = batchItems.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Link
      href="/batches"
      className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-200 font-medium text-sm ml-auto"
      aria-label="Перейти к батчам"
    >
      <Layers className="w-4 h-4 shrink-0" />
      <span>Очередь обработки контактов</span>
      {batchItems.length > 0 && (
        <span className="batch-nav-badge-target flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gray-800 text-white text-xs font-bold">
          {batchItems.length}
        </span>
      )}
      {batchProcessing && totalCount > 0 && (
        <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
          <div
            className="h-full bg-gray-800 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </Link>
  );
}
