/**
 * HEXAGONAL ARCHITECTURE: DOMAIN LAYER — PORTS
 *
 * @remarks
 * Ports для фильтров организаций.
 * SOLID: ISP — разные интерфейсы для разных аспектов фильтрации.
 */

// === PORT 1: Search (Single Responsibility) ===
export interface ISearchPort {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly placeholder?: string;
}

// === PORT 2: Visibility (Single Responsibility) ===
export interface IFilterVisibilityPort {
  readonly showFilters: boolean;
  readonly hasActiveFilters: boolean;
  readonly onShowFiltersToggle: () => void;
}

// === PORT 3: Region Filter (Single Responsibility) ===
export interface IRegionFilterPort {
  readonly regionFilter: string;
  readonly onRegionChange: (id: string) => void;
  readonly regionsList: readonly RegionOption[];
}

// === PORT 4: Okved Filter (Single Responsibility) ===
export interface IOkvedFilterPort {
  readonly okvedFilter: string;
  readonly onOkvedChange: (code: string) => void;
}

// === PORT 5: Revenue Filter (Single Responsibility) ===
export interface IRevenueFilterPort {
  readonly minRevenue: number;
  readonly maxRevenue: number;
  readonly onRevenueChange: (range: [number, number]) => void;
  readonly revenueMax: number;
}

// === PORT 6: Age Filter (Single Responsibility) ===
export interface IAgeFilterPort {
  readonly minAge: number;
  readonly maxAge: number;
  readonly onAgeChange: (range: [number, number]) => void;
  readonly ageMax: number;
}

// === PORT 7: Boolean Filters (Single Responsibility) ===
export interface IBooleanFiltersPort {
  readonly hasGeoFilter: boolean;
  readonly onHasGeoChange: (value: boolean) => void;
  readonly hasDirectorFilter: boolean;
  readonly onHasDirectorChange: (value: boolean) => void;
  readonly hasNameFilter: boolean;
  readonly onHasNameChange: (value: boolean) => void;
}

// === PORT 8: Presets (Single Responsibility) ===
export interface IFilterPresetsPort {
  readonly onApplyPreset: (type: string) => void;
  readonly onResetFilters: () => void;
  readonly presetInfoRef: React.RefObject<HTMLDivElement | null>;
  readonly presetInfoOpen: boolean;
  readonly onPresetInfoOpenChange: (value: boolean) => void;
}

// === PORT 9: Statistics (Single Responsibility) ===
export interface IFilterStatisticsPort {
  readonly totalCount: number;
  readonly totalPages?: number;
}

// === Value Objects ===
export interface RegionOption {
  readonly id: string;
  readonly name: string;
}
