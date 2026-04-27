import { NextResponse } from 'next/server';
import { redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }
  try {
    interface YearStatus { status: string; percentage: number; rows_processed?: number; error?: string; completed_at?: string }
    interface EgrulStatus { status: string; percentage?: number; message?: string; error?: string; completed_at?: string }
    interface RefreshSummaryStatus { status: string; percentage?: number; message?: string; error?: string; rows?: number; elapsedMs?: number; completed_at?: string }
    const statuses: Record<string, YearStatus | EgrulStatus | RefreshSummaryStatus> = {};
    const years = Array.from({ length: 14 }, (_, i) => 2011 + i);
    
    for (const year of years) {
      const state = await redisClient.hgetall(`sync:status:${year}`);
      if (Object.keys(state).length > 0) {
        statuses[year] = {
          status: state.status,
          percentage: parseInt(state.percentage || '0'),
          rows_processed: parseInt(state.rows_processed || '0'),
          error: state.error,
          completed_at: state.completed_at
        };
      } else {
        statuses[year] = { status: 'idle', percentage: 0, rows_processed: 0 };
      }
    }

    const egrulState = await redisClient.hgetall('sync:status:egrul');
    if (Object.keys(egrulState).length > 0) {
      statuses['egrul'] = {
        status: egrulState.status,
        percentage: parseInt(egrulState.percentage || '0'),
        message: egrulState.message,
        error: egrulState.error,
        rows_processed: egrulState.rows_processed ? parseInt(egrulState.rows_processed) : undefined,
        completed_at: egrulState.completed_at
      };
    } else {
      statuses['egrul'] = { status: 'idle', percentage: 0 };
    }

    const refreshState = await redisClient.hgetall('sync:status:refresh_summary');
    if (Object.keys(refreshState).length > 0) {
      statuses['refresh_summary'] = {
        status: refreshState.status,
        percentage: parseInt(refreshState.percentage || '0'),
        message: refreshState.message,
        error: refreshState.error,
        rows: refreshState.rows ? parseInt(refreshState.rows) : undefined,
        elapsedMs: refreshState.elapsedMs ? parseInt(refreshState.elapsedMs) : undefined,
        completed_at: refreshState.completed_at
      };
    } else {
      statuses['refresh_summary'] = { status: 'idle', percentage: 0 };
    }

    return NextResponse.json(statuses);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
