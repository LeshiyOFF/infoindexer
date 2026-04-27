/**
 * Страница организаций
 *
 * @remarks
 * Отображает список организаций с фильтрацией, сортировкой и пагинацией.
 * Использует переиспользуемые hooks для управления состоянием.
 */

"use client";

import { useMemo, useRef, useState } from 'react';
import { useBatch } from '@/contexts/BatchContext';
import { OrganizationsFilters } from './components/OrganizationsFilters';
import { OrganizationsCardList } from './components/OrganizationsCardList';
import { OrganizationsTable } from './components/OrganizationsTable';
import { useOrganizationsFilters } from '@/hooks/useOrganizationsFilters';
import { useOrganizationsData, type FetchDataParams } from '@/hooks/useOrganizationsData';
import { useOrganizationsPagination } from '@/hooks/useOrganizationsPagination';
import { formatCurrency } from '@/lib/currency';
import { REVENUE_MAX, AGE_MAX } from '@/lib/organizations.constants';

/** Форматирование выручки для отображения (данные в тыс. ₽) */
const formatRevenue = (val: number | undefined): string => formatCurrency(val, true);

export default function OrganizationsPage() {
  const { batchItems, toggleBatch, toggleBatchPage } = useBatch();
  const presetInfoRef = useRef<HTMLDivElement>(null);
  const [presetInfoOpen, setPresetInfoOpen] = useState(false);

  // Управление фильтрами
  const filters = useOrganizationsFilters(() => {
    // Сброс страницы при изменении фильтров произойдёт через pagination.resetPage()
  });

  // Управление пагинацией
  const pagination = useOrganizationsPagination(0, () => {
    // Триггер загрузки данных при изменении страницы
  });

  // Параметры для загрузки данных
  const fetchParams = useMemo<FetchDataParams>(
    () => ({
      page: pagination.page,
      search: filters.debouncedSearch,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      regionFilter: filters.regionFilter,
      okvedFilter: filters.okvedFilter,
      minRevenue: filters.minRevenue,
      maxRevenue: filters.maxRevenue,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      hasGeoFilter: filters.hasGeoFilter,
      hasDirectorFilter: filters.hasDirectorFilter,
      hasNameFilter: filters.hasNameFilter
    }),
    [
      pagination.page,
      filters.debouncedSearch,
      filters.sortBy,
      filters.sortOrder,
      filters.regionFilter,
      filters.okvedFilter,
      filters.minRevenue,
      filters.maxRevenue,
      filters.minAge,
      filters.maxAge,
      filters.hasGeoFilter,
      filters.hasDirectorFilter,
      filters.hasNameFilter
    ]
  );

  // Управление данными
  const { data, loading, pagination: apiPagination, handleSort: baseHandleSort } = useOrganizationsData(fetchParams);

  /**
   * Обработка сортировки
   */
  const handleSort = (field: string) => {
    baseHandleSort(field, filters.sortBy, filters.sortOrder, (sortBy, sortOrder) => {
      filters.setSortBy(sortBy);
      filters.setSortOrder(sortOrder);
    });
  };

  /**
   * Вычисленные значения
   */
  const batchInnSet = useMemo(() => new Set(batchItems.map(b => b.inn)), [batchItems]);

  const pageItems = useMemo(
    () =>
      data
        .map(r => ({ inn: r.inn || r.ogrn || '', name: r.name || '' }))
        .filter(x => x.inn) as { inn: string; name: string }[],
    [data]
  );

  /**
   * Обработчик перехода на страницу
   */
  const goToPage = (updater: (p: number) => number) => {
    pagination.goToPage(updater);
  };

  return (
    <div className="space-y-6">
      <OrganizationsFilters
        search={filters.search}
        onSearchChange={filters.setSearch}
        showFilters={filters.showFilters}
        onShowFiltersToggle={filters.toggleShowFilters}
        hasActiveFilters={filters.hasActiveFilters}
        regionFilter={filters.regionFilter}
        onRegionChange={filters.setRegionFilter}
        okvedFilter={filters.okvedFilter}
        onOkvedChange={filters.setOkvedFilter}
        minRevenue={filters.minRevenue}
        maxRevenue={filters.maxRevenue}
        onRevenueChange={filters.setRevenueRange}
        minAge={filters.minAge}
        maxAge={filters.maxAge}
        onAgeChange={filters.setAgeRange}
        hasGeoFilter={filters.hasGeoFilter}
        onHasGeoChange={filters.setHasGeoFilter}
        hasDirectorFilter={filters.hasDirectorFilter}
        onHasDirectorChange={filters.setHasDirectorFilter}
        hasNameFilter={filters.hasNameFilter}
        onHasNameChange={filters.setHasNameFilter}
        onApplyPreset={filters.applyPreset}
        onResetFilters={filters.resetFilters}
        regionsList={filters.regionsList}
        presetInfoRef={presetInfoRef}
        presetInfoOpen={presetInfoOpen}
        onPresetInfoOpenChange={setPresetInfoOpen}
        totalCount={apiPagination.total}
        totalPages={apiPagination.totalPages}
        revenueMax={REVENUE_MAX}
        ageMax={AGE_MAX}
      />

      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="lg:hidden p-4 space-y-4">
          <OrganizationsCardList
            data={data}
            loading={loading}
            pageItems={pageItems}
            batchInnSet={batchInnSet}
            formatCurrency={formatRevenue}
            toggleBatch={toggleBatch}
            toggleBatchPage={toggleBatchPage}
          />
        </div>
        <OrganizationsTable
          data={data}
          loading={loading}
          page={pagination.page}
          pagination={apiPagination}
          pageItems={pageItems}
          batchInnSet={batchInnSet}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          formatCurrency={formatRevenue}
          handleSort={handleSort}
          goToPage={goToPage}
          toggleBatch={toggleBatch}
          toggleBatchPage={toggleBatchPage}
        />
      </div>
    </div>
  );
}
