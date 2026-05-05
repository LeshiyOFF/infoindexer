"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyMeta, FinancialReport, ApiResponse, SanctionDTO } from 'shared/client';
import { getAuthHeaders } from '@/lib/api';
import { CompanyHeader } from './components/CompanyHeader';
import { ContactsSection } from './components/ContactsSection';
import { SanctionsDetailSection } from './components/SanctionsDetailSection';
import { FinancialKPI } from './components/FinancialKPI';
import { ConnectionsCard } from './components/ConnectionsCard';
import { RisksCard } from './components/RisksCard';
import { FinancialCharts } from './components/FinancialCharts';
import { ReportsTable } from './components/ReportsTable';

interface OrganizationDetails {
  readonly data: FinancialReport[];
  readonly meta: CompanyMeta | null;
  readonly connections: Partial<CompanyMeta>[];
  readonly sanctions: readonly SanctionDTO[];
}

export default function OrganizationDashboardPage({ params }: { readonly params: { readonly id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<FinancialReport[]>([]);
  const [meta, setMeta] = useState<CompanyMeta | null>(null);
  const [connections, setConnections] = useState<Partial<CompanyMeta>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<{
    readonly name?: string;
    readonly director?: string;
    readonly status?: string;
    readonly address?: string;
  } | null>(null);
  const [sanctions, setSanctions] = useState<readonly SanctionDTO[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${params.id}`, { headers: getAuthHeaders() });
      const json = await res.json() as ApiResponse<OrganizationDetails>;
      if (json.error) {
        setError(json.error);
      } else if (json.data) {
        setData(json.data.data);
        setMeta(json.data.meta);
        setConnections(json.data.connections || []);
        setSanctions(json.data.sanctions ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest: FinancialReport = data[0] ?? { inn: '', year: 0 } as FinancialReport;
  const previous = data.length > 1 ? data[1] : null;

  const displayStatus = contacts?.status || meta?.status || 'Действующая';

  const chartData = useMemo(() => {
    return [...data].reverse().map(d => ({
      ...d,
      yearStr: `${d.year} г.`,
      revenue: d.PL_revenue,
      netProfit: d.PL_net_profit,
      assets: d.B_assets,
      equity: d.B_total_equity,
    }));
  }, [data]);

  const maxValues = useMemo(() => {
    if (!chartData.length) return { maxRev: 1, maxProfit: 1, maxAssets: 1 };
    const toRubles = (val: string | number | undefined) => {
      const num = typeof val === 'string' ? parseFloat(val) : val || 0;
      return num;
    };
    const maxRev = Math.max(...chartData.map(d => toRubles(d.revenue)), 1);
    const maxProfit = Math.max(...chartData.map(d => Math.abs(toRubles(d.netProfit))), 1);
    const maxAssets = Math.max(...chartData.map(d => toRubles(d.assets)), 1);
    return { maxRev, maxProfit, maxAssets };
  }, [chartData]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span className="font-medium">Анализируем финансовые показатели...</span>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
          ← Назад к списку
        </button>
        <div className="bg-gray-100 text-gray-700 p-6 rounded-2xl border border-gray-200">{error || 'Организация не найдена'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden min-w-0">
      <CompanyHeader
        latest={latest}
        meta={meta}
        contacts={contacts}
        onBack={handleBack}
      />

      <ContactsSection
        organizationId={params.id}
        director={meta?.director ?? 'Нет данных'}
        onContactsChange={setContacts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {connections.length > 0 && (
          <div className={`lg:col-span-2 bg-white`}>
            <ConnectionsCard connections={connections} />
          </div>
        )}

        {meta && (
          <>
            <div className="lg:col-span-1">
              <SanctionsDetailSection sanctions={sanctions} />
            </div>
            <div className="lg:col-span-1">
              <RisksCard data={data} displayStatus={displayStatus} />
            </div>
          </>
        )}
      </div>

      <FinancialKPI latest={latest} previous={previous} maxValues={maxValues} />

      <FinancialCharts data={data} />

      <ReportsTable data={data} chartData={chartData} />
    </div>
  );
}
