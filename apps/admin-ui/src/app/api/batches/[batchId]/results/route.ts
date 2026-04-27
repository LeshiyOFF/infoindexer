import { NextResponse } from 'next/server';
import { redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

interface BatchInnItem {
  inn: string;
  name: string;
}

interface ContactData {
  emails: { val: string; source: string; type?: string }[];
  phones: { val: string; source: string; type?: string }[];
  director?: string;
  name?: string;
}

/** GET /api/batches/:batchId/results — результаты по ИНН (агрегация из contacts:status) */
export async function GET(
  request: Request,
  { params }: { params: { batchId: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const { batchId } = params;
    if (!batchId) {
      return NextResponse.json({ error: 'batchId required' }, { status: 400 });
    }

    const meta = await redisClient.hgetall(`batch:${batchId}`);
    if (!meta || !meta.status) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const inns = meta.inns ? (JSON.parse(meta.inns) as BatchInnItem[]) : [];
    const results: Record<string, { status: string; stage?: string; data?: ContactData; error?: string }> = {};

    if (inns.length > 0) {
      const pipeline = redisClient.pipeline();
      for (const { inn } of inns) {
        pipeline.hgetall(`contacts:status:${inn}`);
      }
      const stateResults = await pipeline.exec();
      if (stateResults) {
        inns.forEach(({ inn }, idx) => {
          const res = stateResults[idx];
          const state = res && res[0] === null ? (res[1] as Record<string, string>) : null;
          if (!state || !state.status) {
            results[inn] = { status: 'idle' };
            return;
          }

          let parsedData: ContactData | null = null;
          if (state.data) {
            try {
              parsedData = JSON.parse(state.data) as ContactData;
            } catch {
              // invalid JSON
            }
          }

          results[inn] = {
            status: state.status,
            stage: state.stage,
            data: parsedData ?? undefined,
            error: state.error
          };
        });
      }
    }

    return NextResponse.json({ batchId, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
