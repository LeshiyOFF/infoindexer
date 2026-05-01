import { NextResponse } from 'next/server';
import { OrganizationService } from 'shared/client';
import { CompanyMeta, ApiResponse, createRateLimitService } from 'shared';
import { clickhouseClient } from 'shared/clickhouse';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import { createRateLimitWrapper } from '@/lib/middleware/rate-limit-wrapper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request): Promise<NextResponse<ApiResponse<CompanyMeta[]>>> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status }) as NextResponse<ApiResponse<CompanyMeta[]>>;
  }

  // Rate limiting check
  const rateLimit = createRateLimitService();
  const wrapper = createRateLimitWrapper(rateLimit);
  const rateLimitResult = await wrapper.check(request, 'search');

  if (!rateLimitResult.allowed) {
    return wrapper.createTooManyRequestsResponse(rateLimitResult) as NextResponse<ApiResponse<CompanyMeta[]>>;
  }

  const apiStart = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = (searchParams.get('search') || '').trim();
    const sortBy = searchParams.get('sortBy') || 'records_count';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const region = searchParams.get('region') || '';
    const hasGeo = searchParams.get('hasGeo') || '';
    
    const minRevenue = searchParams.get('minRevenue') ? parseInt(searchParams.get('minRevenue')!) : undefined;
    const maxRevenue = searchParams.get('maxRevenue') ? parseInt(searchParams.get('maxRevenue')!) : undefined;
    const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!) : undefined;
    const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!) : undefined;
    const minCharterCapital = searchParams.get('minCharterCapital') ? parseInt(searchParams.get('minCharterCapital')!) : undefined;
    const status = searchParams.get('status') || undefined;
    const hasDirector = searchParams.get('hasDirector') === 'true' ? true : undefined;
    const hasName = searchParams.get('hasName') === 'true';
    const okved = (searchParams.get('okved') || '').trim() || undefined;

    const service = new OrganizationService(clickhouseClient);
    const response = await service.search({
      search, page, limit, sortBy, sortOrder, region, hasGeo,
      minRevenue, maxRevenue, minAge, maxAge, minCharterCapital, status, hasDirector,
      hasName: hasName || undefined,
      okved
    });

    const elapsed = Date.now() - apiStart;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API /organizations] ${elapsed}ms | sortBy=${sortBy} search="${search.slice(0, 20)}" filters=region:${!!region},hasGeo:${!!hasGeo}`);
    }

    const nextResponse = NextResponse.json(response);
    return wrapper.addHeadersToResponse(nextResponse, rateLimitResult) as NextResponse<ApiResponse<CompanyMeta[]>>;
  } catch (error) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: [], error: message } satisfies ApiResponse<CompanyMeta[]>, { status: 500 });
  }
}

