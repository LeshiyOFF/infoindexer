/**
 * Desktop таблица организаций
 *
 * @remarks
 * Presentation Layer: Container компонент.
 * SOLID:
 * - SRP: Оркестрация подкомпонентов, без бизнес-логики
 * - DIP: Зависит от Ports через props
 *
 * DRY: Все подкомпоненты переиспользуемы
 */

"use client";

import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import type { CompanyMeta } from 'shared/client';
import { TableHeader } from './table/TableHeader';
import { OrganizationTableRow } from './table/OrganizationTableRow';
import { OrganizationsPagination } from './table/OrganizationsPagination';

export interface OrganizationsTableProps {
  readonly data: readonly CompanyMeta[];
  readonly loading: boolean;
  readonly page: number;
  readonly pagination: {
    readonly total: number;
    readonly totalPages: number;
  };
  readonly pageItems: { inn: string; name: string }[];
  readonly batchInnSet: ReadonlySet<string>;
  readonly sortBy: string;
  readonly sortOrder: 'ASC' | 'DESC';
  readonly formatCurrency: (value: number | undefined) => string;
  readonly handleSort: (field: string) => void;
  readonly goToPage: (updater: (p: number) => number) => void;
  readonly toggleBatch: (inn: string, name: string, e: React.MouseEvent) => void;
  readonly toggleBatchPage: (items: { inn: string; name: string }[], e?: React.SyntheticEvent) => void;
}

export const OrganizationsTable = memo(function OrganizationsTable({
  data,
  loading,
  page,
  pagination,
  pageItems,
  batchInnSet,
  sortBy,
  sortOrder,
  formatCurrency,
  handleSort,
  goToPage,
  toggleBatch,
  toggleBatchPage
}: OrganizationsTableProps) {
  const canGoNext = page < pagination.totalPages;
  const canGoPrev = page > 1;

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: 720 }}>
        <TableHeader
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          pageItems={pageItems}
          batchInnSet={batchInnSet}
          toggleBatchPage={toggleBatchPage}
        />
        <TableBody
          data={data}
          loading={loading}
          batchInnSet={batchInnSet}
          toggleBatch={toggleBatch}
          formatCurrency={formatCurrency}
        />
      </table>
      <OrganizationsPagination
        page={page}
        totalPages={pagination.totalPages}
        goToPage={goToPage}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        total={pagination.total}
      />
    </div>
  );
});

// === Table Body ===

interface TableBodyProps {
  readonly data: readonly CompanyMeta[];
  readonly loading: boolean;
  readonly batchInnSet: ReadonlySet<string>;
  readonly toggleBatch: (inn: string, name: string, e: React.MouseEvent) => void;
  readonly formatCurrency: (value: number | undefined) => string;
}

const TableBody = memo(function TableBody({
  data,
  loading,
  batchInnSet,
  toggleBatch,
  formatCurrency
}: TableBodyProps) {
  if (loading) {
    return <LoadingRow />;
  }

  if (data.length === 0) {
    return <EmptyRow />;
  }

  return (
    <tbody className="divide-y divide-gray-100 text-gray-800">
      {data.map((company) => (
        <OrganizationTableRow
          key={company.inn || company.ogrn}
          company={company}
          isInBatch={batchInnSet.has(company.inn || company.ogrn || '')}
          toggleBatch={toggleBatch}
          formatCurrency={formatCurrency}
        />
      ))}
    </tbody>
  );
});

const LoadingRow = memo(function LoadingRow() {
  return (
    <tbody>
      <tr>
        <td colSpan={5} className="px-6 py-16 text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
          </div>
        </td>
      </tr>
    </tbody>
  );
});

const EmptyRow = memo(function EmptyRow() {
  return (
    <tbody>
      <tr>
        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
          Организации не найдены.
        </td>
      </tr>
    </tbody>
  );
});
