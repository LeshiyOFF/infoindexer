"use client";

import { useCallback, useId, useRef, useState } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
  formatValue?: (v: number) => string;
  className?: string;
}

/**
 * Двухточечный range-слайдер: одна линия, два движущихся ползунка (min и max).
 * На мобильных использует оверлей для корректной работы обеих точек (нативный input
 * на touch-устройствах перехватывает события только правой точки).
 */
export function DualRangeSlider({
  min,
  max,
  step,
  value: [low, high],
  onChange,
  label,
  formatValue = (v) => String(v),
  className = "",
}: DualRangeSliderProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const range = max - min;
  const lowPct = range > 0 ? ((low - min) / range) * 100 : 0;
  const highPct = range > 0 ? ((high - min) / range) * 100 : 100;
  const midpoint = (lowPct + highPct) / 2;

  const [activeThumb, setActiveThumb] = useState<"low" | "high" | null>(null);

  const xToValue = useCallback(
    (xPct: number) => {
      const raw = min + (xPct / 100) * range;
      const steps = Math.round(raw / step);
      return Math.max(min, Math.min(max, steps * step));
    },
    [min, max, range, step]
  );

  const handleOverlayPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const xPct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const thumb: "low" | "high" = xPct < midpoint ? "low" : "high";
      setActiveThumb(thumb);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [midpoint]
  );

  const handleOverlayPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activeThumb === null || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const val = xToValue(xPct);
      if (activeThumb === "low") {
        const newLow = Math.min(val, high - step);
        onChange([newLow, high]);
      } else {
        const newHigh = Math.max(val, low + step);
        onChange([low, newHigh]);
      }
    },
    [activeThumb, low, high, step, onChange, xToValue]
  );

  const handleOverlayPointerUp = useCallback(() => {
    setActiveThumb(null);
  }, []);

  const handleLowChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      const newLow = Math.min(v, high - step);
      onChange([newLow, high]);
    },
    [high, step, onChange]
  );

  const handleHighChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      const newHigh = Math.max(v, low + step);
      onChange([low, newHigh]);
    },
    [low, step, onChange]
  );

  const thumbClass =
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={`${id}-low`}
          className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest"
        >
          {label}: {formatValue(low)} — {formatValue(high)}
        </label>
      )}
      <div
        ref={containerRef}
        className="relative h-12 flex items-center touch-none py-2"
      >
        {/* Общая линия трека */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-gray-200" />
        {/* Заполненный участок между min и max */}
        <div
          className="absolute h-2 rounded-full bg-gray-900"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        {/* Слайдер min (левый ползунок) */}
        <input
          id={`${id}-low`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLowChange}
          className={`absolute w-full h-2 appearance-none bg-transparent ${thumbClass}`}
          style={{ zIndex: 1, pointerEvents: "none" }}
          aria-label="Минимум"
        />
        {/* Слайдер max (правый ползунок) */}
        <input
          id={`${id}-high`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHighChange}
          className={`absolute w-full h-2 appearance-none bg-transparent ${thumbClass}`}
          style={{ zIndex: 1, pointerEvents: "none" }}
          aria-label="Максимум"
        />
        {/* Оверлей перехватывает все касания и вручную управляет значениями (фикс мобильного — только правая точка хваталась) */}
        <div
            className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
            onPointerDown={handleOverlayPointerDown}
            onPointerMove={handleOverlayPointerMove}
            onPointerUp={handleOverlayPointerUp}
            onPointerCancel={handleOverlayPointerUp}
            onPointerLeave={handleOverlayPointerUp}
          />
      </div>
    </div>
  );
}
