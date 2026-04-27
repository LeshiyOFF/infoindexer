/**
 * Hook для управления модальными окнами на странице настроек
 *
 * @remarks
 * Централизованное управление состояниями трёх модальных окон.
 */

"use client";

import { useCallback, useState } from 'react';

/**
 * Состояние модальных окон
 */
export interface ModalState {
  downloadOpen: boolean;
  manageOpen: boolean;
  egrulManageOpen: boolean;
}

/**
 * Действия с модальными окнами
 */
export interface ModalActions {
  openDownload: () => void;
  closeDownload: () => void;
  openManage: () => void;
  closeManage: () => void;
  openEgrulManage: () => void;
  closeEgrulManage: () => void;
}

/**
 * Хук для управления модальными окнами
 */
export function useModalState(): ModalState & ModalActions {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [egrulManageOpen, setEgrulManageOpen] = useState(false);

  const openDownload = useCallback(() => setDownloadOpen(true), []);
  const closeDownload = useCallback(() => setDownloadOpen(false), []);

  const openManage = useCallback(() => setManageOpen(true), []);
  const closeManage = useCallback(() => setManageOpen(false), []);

  const openEgrulManage = useCallback(() => setEgrulManageOpen(true), []);
  const closeEgrulManage = useCallback(() => setEgrulManageOpen(false), []);

  return {
    downloadOpen,
    manageOpen,
    egrulManageOpen,
    openDownload,
    closeDownload,
    openManage,
    closeManage,
    openEgrulManage,
    closeEgrulManage
  };
}
