/**
 * Grid с combobox и slider для фильтров
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только combobox + sliders.
 * ISP: зависит только от нужных Ports.
 */

"use client";

import { memo } from 'react';
import { RegionCombobox } from '@/components/ui/RegionCombobox';
import { OkvedCombobox } from '@/components/ui/OkvedCombobox';
import { DualRangeSlider } from '@/components/ui/DualRangeSlider';
import type { RegionOption } from '../../domain/ports/filter-ports';
import type {
  IRegionFilterPort,
  IOkvedFilterPort,
  IRevenueFilterPort,
  IAgeFilterPort
} from '../../domain/ports/filter-ports';

export interface FiltersGridProps extends
  IRegionFilterPort,
  IOkvedFilterPort,
  IRevenueFilterPort,
  IAgeFilterPort {}

export const FiltersGrid = memo(function FiltersGrid({
  regionFilter,
  onRegionChange,
  regionsList,
  okvedFilter,
  onOkvedChange,
  minRevenue,
  maxRevenue,
  onRevenueChange,
  revenueMax,
  minAge,
  maxAge,
  onAgeChange,
  ageMax
}: FiltersGridProps) {
  // Fix readonly type for RegionCombobox
  const regionsListMutable = regionsList as RegionOption[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div>
        <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">
          Регион
        </label>
        <RegionCombobox
          value={regionFilter}
          onChange={onRegionChange}
          options={regionsListMutable}
          placeholder="Все регионы"
        />
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">
          ОКВЭД
        </label>
        <OkvedCombobox
          value={okvedFilter}
          onChange={onOkvedChange}
          placeholder="Все виды деятельности"
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <DualRangeSlider
          min={0}
          max={revenueMax}
          step={100}
          value={[minRevenue, maxRevenue]}
          onChange={onRevenueChange}
          label="Выручка (тыс. ₽)"
          formatValue={(v) => v.toLocaleString('ru-RU')}
        />
      </div>

      <div>
        <DualRangeSlider
          min={0}
          max={ageMax}
          step={1}
          value={[minAge, maxAge]}
          onChange={onAgeChange}
          label="Возраст (лет)"
        />
      </div>
    </div>
  );
});
