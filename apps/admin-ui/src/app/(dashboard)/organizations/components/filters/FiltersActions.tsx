/**
 * Actions для фильтров: чекбоксы, пресеты, сброс
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только actions.
 * ISP: зависит только от нужных Ports.
 */

"use client";

import { memo } from 'react';
import { Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PresetTooltipPortal } from '../PresetTooltipPortal';
import type { IBooleanFiltersPort, IFilterPresetsPort } from '../../domain/ports/filter-ports';

export interface FiltersActionsProps extends
  IBooleanFiltersPort,
  IFilterPresetsPort {}

export const FiltersActions = memo(function FiltersActions({
  hasGeoFilter,
  onHasGeoChange,
  hasDirectorFilter,
  onHasDirectorChange,
  hasNameFilter,
  onHasNameChange,
  onApplyPreset,
  onResetFilters,
  presetInfoRef,
  presetInfoOpen,
  onPresetInfoOpenChange
}: FiltersActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <BooleanFilter
          label="С геоданными"
          checked={hasGeoFilter}
          onChange={onHasGeoChange}
        />
        <BooleanFilter
          label="С директором"
          checked={hasDirectorFilter}
          onChange={onHasDirectorChange}
        />
        <BooleanFilter
          label="С названием из ЕГРЮЛ"
          checked={hasNameFilter}
          onChange={onHasNameChange}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 ml-auto">
        <PresetButton
          onApply={onApplyPreset}
          infoRef={presetInfoRef}
          infoOpen={presetInfoOpen}
          onInfoToggle={onPresetInfoOpenChange}
        />
        <ResetButton onReset={onResetFilters} />
      </div>
    </div>
  );
});

// === Sub-components ===

interface BooleanFilterProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

const BooleanFilter = memo(function BooleanFilter({ label, checked, onChange }: BooleanFilterProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-2 border-gray-300 accent-black w-4 h-4"
      />
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </label>
  );
});

interface PresetButtonProps {
  readonly onApply: (type: string) => void;
  readonly infoRef: React.RefObject<HTMLDivElement | null>;
  readonly infoOpen: boolean;
  readonly onInfoToggle: (open: boolean) => void;
}

const PresetButton = memo(function PresetButton({ onApply, infoRef, infoOpen, onInfoToggle }: PresetButtonProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onApply('real_companies')}
        className="px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
      >
        Отсеять однодневки
      </button>
      <div
        ref={infoRef as React.RefObject<HTMLDivElement>}
        className="relative"
        onMouseEnter={() => onInfoToggle(true)}
        onMouseLeave={() => onInfoToggle(false)}
      >
        <button
          type="button"
          onClick={() => onInfoToggle(!infoOpen)}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Подсказка"
        >
          <Info className="w-4 h-4" />
        </button>
        {infoOpen && typeof document !== 'undefined' && createPortal(
          <PresetTooltipPortal anchorRef={infoRef} onClose={() => onInfoToggle(false)} />,
          document.body
        )}
      </div>
    </div>
  );
});

interface ResetButtonProps {
  readonly onReset: () => void;
}

const ResetButton = memo(function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className="px-3 py-1.5 text-xs font-black uppercase text-gray-400 hover:text-gray-700 transition-colors"
    >
      Сбросить все
    </button>
  );
});
