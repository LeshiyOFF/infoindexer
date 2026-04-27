/**
 * Header компонент для таблицы с сортировкой
 *
 * @remarks
 * Presentation Layer: stateless компонент.
 * SOLID: SRP — только заголовок с сортировкой.
 */

"use client";

import { memo, useCallback } from 'react';
import { SortIcon } from './SortIcon';
import { BatchSelectHeader } from '../BatchSelectHeader';
import type { ISortPort, IBatchSelectionPort } from '../../domain/ports/table-ports';

export interface TableHeaderProps {
  readonly sortBy: ISortPort['sortBy'];
  readonly sortOrder: ISortPort['sortOrder'];
  readonly handleSort: ISortPort['handleSort'];
  readonly pageItems: { inn: string; name: string }[];
  readonly batchInnSet: IBatchSelectionPort['batchInnSet'];
  readonly toggleBatchPage: (items: { inn: string; name: string }[], e?: React.SyntheticEvent) => void;
}

export const TableHeader = memo(function TableHeader({
  sortBy,
  sortOrder,
  handleSort,
  pageItems,
  batchInnSet,
  toggleBatchPage
}: TableHeaderProps) {
  const createSortHandler = useCallback((field: string) =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      handleSort(field);
    }, [handleSort]);

  const allPageInBatch = pageItems.length > 0 && pageItems.every(x => batchInnSet.has(x.inn));
  const somePageInBatch = pageItems.some(x => batchInnSet.has(x.inn));

  return (
    <thead className="bg-gradient-to-r from-gray-100 to-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b-2 border-gray-200">
      <tr>
        <SortableHeaderCell
          field="name"
          label="Название"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={createSortHandler('name')}
        />
        <SortableHeaderCell
          field="revenue"
          label="Выручка"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={createSortHandler('revenue')}
        />
        <SortableHeaderCell
          field="age"
          label="Возраст"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={createSortHandler('age')}
        />
        <th className="px-6 py-4 text-center">Гео</th>
        <th className="px-6 py-4 text-center w-20" onClick={(e) => e.stopPropagation()}>
          <BatchSelectHeader
            allPageInBatch={allPageInBatch}
            somePageInBatch={somePageInBatch}
            pageItems={pageItems}
            toggleBatchPage={toggleBatchPage}
            variant="desktop"
          />
        </th>
      </tr>
    </thead>
  );
});

interface SortableHeaderCellProps {
  readonly field: string;
  readonly label: string;
  readonly sortBy: string;
  readonly sortOrder: 'ASC' | 'DESC';
  readonly onSort: (e: React.MouseEvent) => void;
}

const SortableHeaderCell = memo(function SortableHeaderCell({
  field,
  label,
  sortBy,
  sortOrder,
  onSort
}: SortableHeaderCellProps) {
  return (
    <th
      className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
      onClick={onSort}
    >
      {label} <SortIcon sortBy={sortBy} sortOrder={sortOrder} field={field} />
    </th>
  );
});
