/**
 * Container для фильтров организаций
 *
 * @remarks
 * Presentation Layer: Container компонент.
 * SOLID:
 * - SRP: Оркестрация подкомпонентов
 * - ISP: Compose из Ports, не зависит от конкретных реализаций
 * - DIP: Зависит от абстракций (Ports)
 *
 * DRY: Подкомпоненты переиспользуемы
 */

"use client";

import { memo } from 'react';
import { FiltersHeader } from './filters/FiltersHeader';
import { FiltersGrid } from './filters/FiltersGrid';
import { FiltersActions } from './filters/FiltersActions';
import type {
  ISearchPort,
  IFilterVisibilityPort,
  IFilterStatisticsPort,
  IRegionFilterPort,
  IOkvedFilterPort,
  IRevenueFilterPort,
  IAgeFilterPort,
  IBooleanFiltersPort,
  IFilterPresetsPort
} from '../domain/ports/filter-ports';

// === Composite Port (ISP: клиент зависит только от нужных методов) ===
export interface OrganizationsFiltersProps extends
  ISearchPort,
  IFilterVisibilityPort,
  IFilterStatisticsPort,
  IRegionFilterPort,
  IOkvedFilterPort,
  IRevenueFilterPort,
  IAgeFilterPort,
  IBooleanFiltersPort,
  IFilterPresetsPort {}

export const OrganizationsFilters = memo(function OrganizationsFilters(props: OrganizationsFiltersProps) {
  const { showFilters } = props;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-200 space-y-4">
      <FiltersHeader
        totalCount={props.totalCount}
        totalPages={props.totalPages}
        search={props.search}
        onSearchChange={props.onSearchChange}
        showFilters={props.showFilters}
        hasActiveFilters={props.hasActiveFilters}
        onShowFiltersToggle={props.onShowFiltersToggle}
      />

      {showFilters && (
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <FiltersGrid
            regionFilter={props.regionFilter}
            onRegionChange={props.onRegionChange}
            regionsList={props.regionsList}
            okvedFilter={props.okvedFilter}
            onOkvedChange={props.onOkvedChange}
            minRevenue={props.minRevenue}
            maxRevenue={props.maxRevenue}
            onRevenueChange={props.onRevenueChange}
            revenueMax={props.revenueMax}
            minAge={props.minAge}
            maxAge={props.maxAge}
            onAgeChange={props.onAgeChange}
            ageMax={props.ageMax}
          />
          <FiltersActions
            hasGeoFilter={props.hasGeoFilter}
            onHasGeoChange={props.onHasGeoChange}
            hasDirectorFilter={props.hasDirectorFilter}
            onHasDirectorChange={props.onHasDirectorChange}
            hasNameFilter={props.hasNameFilter}
            onHasNameChange={props.onHasNameChange}
            onApplyPreset={props.onApplyPreset}
            onResetFilters={props.onResetFilters}
            presetInfoRef={props.presetInfoRef}
            presetInfoOpen={props.presetInfoOpen}
            onPresetInfoOpenChange={props.onPresetInfoOpenChange}
          />
        </div>
      )}
    </div>
  );
});
