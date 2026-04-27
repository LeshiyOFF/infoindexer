"use client";

import { Trash2, DownloadCloud } from "lucide-react";
import { useBatch } from "@/contexts/BatchContext";
import { abbreviateLegalForm } from "@/lib/companyName";

export function BatchActivePanel() {
  const {
    batchItems,
    batchProgress,
    batchProcessing,
    removeFromBatch,
    startBatch,
    clearBatch
  } = useBatch();

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 shrink-0">
      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden w-full min-w-0 flex-1 box-border">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
          Выбранные компании
        </h2>
        <div className="flex-1 min-h-0 overflow-auto space-y-2">
          {batchItems.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Добавьте компании со страницы организаций
            </p>
          ) : (
            batchItems.map(b => (
              <div
                key={b.inn}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
              >
                <span className="truncate flex-1 text-sm text-gray-900" title={b.name}>
                  {abbreviateLegalForm(b.name) || b.name}
                </span>
                {batchProcessing ? (
                  (() => {
                    const p = batchProgress[b.inn];
                    if (!p) return null;
                    if (p.status === "running") {
                      const match = (p.stage || "").match(/(\d+)\/(\d+)/);
                      if (!match) {
                        return (
                          <span className="text-gray-500 shrink-0 text-[10px] font-bold">
                            В очереди
                          </span>
                        );
                      }
                      const pct = Math.round(
                        (parseInt(match[1], 10) / parseInt(match[2], 10)) * 100
                      );
                      return (
                        <div className="flex items-center gap-2 shrink-0 w-24">
                          <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-800 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">
                            {pct}%
                          </span>
                        </div>
                      );
                    }
                    if (p.status === "completed")
                      return (
                        <span className="text-gray-800 shrink-0 text-xs font-bold">
                          Готово
                        </span>
                      );
                    if (p.status === "error")
                      return (
                        <span className="text-red-600 shrink-0 text-xs font-bold">
                          Ошибка
                        </span>
                      );
                    return null;
                  })()
                ) : (
                  <button
                    onClick={e => removeFromBatch(b.inn, e)}
                    className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all duration-200 shrink-0"
                    aria-label="Удалить из батча"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {!batchProcessing && batchItems.length > 0 && (
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={startBatch}
              disabled={batchItems.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <DownloadCloud className="w-5 h-5 shrink-0" />
              Обработать
            </button>
            <button
              onClick={clearBatch}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-all duration-200"
            >
              <Trash2 className="w-5 h-5 shrink-0" />
              Очистить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
