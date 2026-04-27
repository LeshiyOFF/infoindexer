"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ContentTooltipPortalProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  content: string;
  onClose: () => void;
}

const TOOLTIP_W = 280;
const TOOLTIP_GAP = 6;

export function ContentTooltipPortal({ anchorRef, content, onClose }: ContentTooltipPortalProps) {
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
      const half = TOOLTIP_W / 2;
      let left = rect.left + rect.width / 2 - half;
      left = Math.max(TOOLTIP_GAP, Math.min(left, vw - TOOLTIP_W - TOOLTIP_GAP));
      const spaceAbove = rect.top;
      const above = spaceAbove >= 80;
      setPos({
        left,
        top: above ? rect.top - TOOLTIP_GAP : rect.bottom + TOOLTIP_GAP,
        above
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef]);

  if (!pos) return null;
  return createPortal(
    <div
      className="fixed z-[9999] px-3 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-medium leading-relaxed shadow-lg max-w-[min(280px,90vw)] whitespace-normal"
      style={{
        left: pos.left,
        top: pos.top,
        width: TOOLTIP_W,
        transform: pos.above ? 'translateY(-100%)' : 'none'
      }}
      role="tooltip"
      onClick={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      {content}
    </div>,
    document.body
  );
}
