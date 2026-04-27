/**
 * Data Management Card
 */

"use client";

import { memo } from 'react';
import { FinancialReportsSection } from './DataManagementCard/FinancialReportsSection';
import { EgrulSection } from './DataManagementCard/EgrulSection';
import { SanctionsSection } from './DataManagementCard/SanctionsSection';
import { CacheSection } from './DataManagementCard/CacheSection';
import type { CancelButtonState } from '@/components/ui/CancelButton';
import type {
  YearStatus,
  EgrulStatus,
  SanctionsStatus,
  RefreshSummaryStatus
} from '@/types/settings.types';

export interface DataManagementCardProps {
  readonly yearStatuses: Readonly<Record<number, YearStatus>>;
  readonly egrulStatus: EgrulStatus;
  readonly sanctionsStatus: SanctionsStatus;
  readonly summaryStatus: RefreshSummaryStatus | undefined;
  readonly anySyncRunning: boolean;
  readonly formatLastSync: (iso?: string) => string | null;
  readonly onDownloadClick: () => void;
  readonly onManageClick: () => void;
  readonly onEgrulSync: () => void;
  readonly onSanctionsSync: () => void;
  readonly onEgrulManageClick: () => void;
  readonly onRefreshSummary: () => void;
  // Abort handlers
  readonly onAbortYear?: (year: number) => void;
  readonly onAbortEgrul?: () => void;
  readonly onAbortSanctions?: () => void;
  readonly onAbortSummary?: () => void;
  // Cancel state providers
  readonly getYearCancelState?: (year: number) => CancelButtonState;
  readonly getEgrulCancelState?: () => CancelButtonState;
  readonly getSanctionsCancelState?: () => CancelButtonState;
  readonly getSummaryCancelState?: () => CancelButtonState;
}

export const DataManagementCard = memo(function DataManagementCard({
  yearStatuses,
  egrulStatus,
  sanctionsStatus,
  summaryStatus,
  anySyncRunning,
  formatLastSync,
  onDownloadClick,
  onManageClick,
  onEgrulSync,
  onSanctionsSync,
  onEgrulManageClick,
  onRefreshSummary,
  onAbortYear,
  onAbortEgrul,
  onAbortSanctions,
  onAbortSummary,
  getYearCancelState,
  getEgrulCancelState,
  getSanctionsCancelState,
  getSummaryCancelState
}: DataManagementCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Управление данными
      </h2>

      <div className="space-y-6">
        <FinancialReportsSection
          yearStatuses={yearStatuses}
          onDownloadClick={onDownloadClick}
          onManageClick={onManageClick}
          onAbortYear={onAbortYear}
          getCancelState={getYearCancelState}
        />

        <EgrulSection
          egrulStatus={egrulStatus}
          anySyncRunning={anySyncRunning}
          formatLastSync={formatLastSync}
          onSync={onEgrulSync}
          onManageClick={onEgrulManageClick}
          onAbort={onAbortEgrul}
          getCancelState={getEgrulCancelState}
        />

        <SanctionsSection
          sanctionsStatus={sanctionsStatus}
          formatLastSync={formatLastSync}
          onSync={onSanctionsSync}
          onAbort={onAbortSanctions}
          getCancelState={getSanctionsCancelState}
        />

        <CacheSection
          summaryStatus={summaryStatus}
          anySyncRunning={anySyncRunning}
          formatLastSync={formatLastSync}
          onRefresh={onRefreshSummary}
          onAbort={onAbortSummary}
          getCancelState={getSummaryCancelState}
        />
      </div>
    </div>
  );
});
