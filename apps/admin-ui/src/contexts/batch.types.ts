/**
 * Типы для контекста батча
 */

/** Элемент батча - организация */
export interface BatchItem {
  inn: string;
  name: string;
}

/** Прогресс обработки контактов организации */
export interface BatchProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  stage?: string;
  data?: {
    emails: { val: string; source: string; type?: 'direct' | 'official' | 'general' | 'verified' }[];
    phones: { val: string; source: string; type?: 'direct' | 'official' | 'general' | 'verified' }[];
    director?: string;
    name?: string;
  };
  error?: string;
}

/** Значение контекста батча */
export interface BatchContextValue {
  batchItems: BatchItem[];
  currentBatchId: string | null;
  batchProgress: Record<string, BatchProgress>;
  batchProcessing: boolean;
  overlayOpen: boolean;
  toggleBatch: (inn: string, name: string, e: React.MouseEvent) => void;
  toggleBatchPage: (items: { inn: string; name: string }[], e?: React.SyntheticEvent) => void;
  removeFromBatch: (inn: string, e: React.MouseEvent) => void;
  startBatch: () => Promise<void>;
  clearBatch: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
  setOverlayOpen: (open: boolean) => void;
}
