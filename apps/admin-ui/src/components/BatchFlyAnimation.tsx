/**
 * Анимация полёта иконки в навигацию батча
 *
 * @remarks
 * Создаёт визуальный эффект перелёта иконки от исходной позиции к бейджу навигации.
 * Использует createPortal для рендера в body и requestAnimationFrame для анимации.
 */

"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { BATCH_NAV_BADGE_CLASS } from '@/lib/batch';

/** Props для компонента BatchFlyAnimation */
export interface BatchFlyAnimationProps {
  /** Исходная позиция элемента */
  from: DOMRect;
  /** Callback завершения анимации */
  onComplete: () => void;
}

/**
 * Компонент анимации полёта иконки
 *
 * @param props - BatchFlyAnimationProps
 */
export function BatchFlyAnimation({ from, onComplete }: BatchFlyAnimationProps): React.ReactNode {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Находим видимый целевой элемент для анимации
    const targets = document.querySelectorAll(`.${BATCH_NAV_BADGE_CLASS}`);
    const visible = Array.from(targets).find(t => {
      const r = t.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    const targetRect = visible?.getBoundingClientRect();
    if (targetRect) {
      // Вычисляем центр целевого элемента
      const toX = targetRect.left + targetRect.width / 2 - 12;
      const toY = targetRect.top + targetRect.height / 2 - 12;

      // Запускаем анимацию в следующем кадре
      requestAnimationFrame(() => {
        el.style.transition = 'left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s';
        el.style.left = `${toX}px`;
        el.style.top = `${toY}px`;
        el.style.opacity = '0';
      });
    }

    // Завершаем анимацию через 900мс
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [from, onComplete]);

  // Рендерим в body через createPortal
  if (typeof document === 'undefined') return null;

  const content = (
    <div
      ref={elRef}
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: from.left,
        top: from.top,
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgb(31 41 55)',
        borderRadius: 12,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        transition: 'none'
      }}
    >
      <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>
  );

  return createPortal(content, document.body);
}
