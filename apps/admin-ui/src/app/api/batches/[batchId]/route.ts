import { NextResponse } from 'next/server';
import { redisClient } from 'shared/redis';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

interface BatchInnItem {
  inn: string;
  name: string;
}

/** GET /api/batches/:batchId — метаданные и агрегированный статус батча */
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
    const totalCount = inns.length;

    let completedCount = parseInt(meta.completedCount || '0', 10);
    if (meta.status === 'running' && inns.length > 0) {
      const batchPipeline = redisClient.pipeline();
      for (const { inn } of inns) {
        batchPipeline.hget(`batch:${batchId}:inn_status`, inn);
      }
      const batchResults = await batchPipeline.exec();
      const needFallback: string[] = [];
      const statuses: (string | null)[] = [];
      if (batchResults) {
        for (const res of batchResults) {
          const st = res && res[0] === null ? (res[1] as string) : null;
          statuses.push(st);
          if (st === null) needFallback.push(inns[statuses.length - 1].inn);
        }
      }
      const fallbackMap = new Map<string, string>();
      if (needFallback.length > 0) {
        const fallbackInns = Array.from(new Set(needFallback));
        const fallbackPipeline = redisClient.pipeline();
        for (const inn of fallbackInns) {
          fallbackPipeline.hget(`contacts:status:${inn}`, 'status');
        }
        const fallbackResults = await fallbackPipeline.exec();
        if (fallbackResults) {
          fallbackInns.forEach((inn, i) => {
            const r = fallbackResults[i];
            const st = r && r[0] === null ? (r[1] as string) : null;
            if (st) fallbackMap.set(inn, st);
          });
        }
      }
      let done = 0;
      inns.forEach(({ inn }, i) => {
        let st = statuses[i] ?? null;
        if (st === null) st = fallbackMap.get(inn) ?? null;
        if (st === 'completed' || st === 'error') done++;
      });
      completedCount = done;
      if (done === totalCount) {
        await redisClient.hset(`batch:${batchId}`, 'status', 'completed');
        meta.status = 'completed';
      }
    }

    return NextResponse.json({
      batchId,
      status: meta.status,
      createdAt: parseInt(meta.createdAt || '0', 10),
      inns,
      totalCount,
      completedCount
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
