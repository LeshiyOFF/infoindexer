/**
 * API Route для батчей
 *
 * @remarks
 * Hexagonal Architecture: Infrastructure Layer — HTTP Route.
 *
 * SOLID:
 * - SRP: Только HTTP handling, делегирует сервису
 * - DIP: Зависит от Ports через Factory
 */

import { NextResponse } from 'next/server';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import { BatchListService } from './domain/services/batch-list.service';
import { RedisBatchAdapter } from './infrastructure/adapters/redis-batch.adapter';
import type { IBatchRepositoryPort, IAuthenticationPort, BatchInnItem } from './domain/ports/batch-ports';

const BATCH_LIMIT = 50;

// === Factory (Dependency Injection) ===
const createRepository = (): IBatchRepositoryPort => new RedisBatchAdapter();

const createAuthService = (): IAuthenticationPort => ({
  isAuthenticated: checkAuth,
  unauthorizedResponse: UNAUTHORIZED_RESPONSE
});

// === GET Handler ===
export async function GET(request: Request) {
  const authService = createAuthService();

  if (!authService.isAuthenticated(request)) {
    return NextResponse.json(
      authService.unauthorizedResponse.json,
      { status: authService.unauthorizedResponse.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(BATCH_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const repository = createRepository();
    const service = new BatchListService(repository);
    const result = await service.getBatchList(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// === POST Handler ===
export async function POST(request: Request) {
  const authService = createAuthService();

  if (!authService.isAuthenticated(request)) {
    return NextResponse.json(
      authService.unauthorizedResponse.json,
      { status: authService.unauthorizedResponse.status }
    );
  }

  try {
    const body = (await request.json()) as { inns?: BatchInnItem[] };
    const rawInns = Array.isArray(body?.inns) ? body.inns : [];

    if (rawInns.length === 0) {
      return NextResponse.json(
        { error: 'inns array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (rawInns.length > BATCH_LIMIT) {
      return NextResponse.json(
        { error: `Maximum ${BATCH_LIMIT} organizations per batch` },
        { status: 400 }
      );
    }

    const inns: BatchInnItem[] = rawInns.filter(
      (x): x is BatchInnItem => x && typeof x.inn === 'string' && x.inn.length > 0
    ).map(x => ({ inn: x.inn, name: typeof x.name === 'string' ? x.name : '' }));

    if (inns.length === 0) {
      return NextResponse.json({ error: 'No valid inns' }, { status: 400 });
    }

    const repository = createRepository();
    const batchId = `b_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const createdAt = Date.now();

    await repository.createBatch({ inns, batchId, createdAt });

    return NextResponse.json({ batchId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
