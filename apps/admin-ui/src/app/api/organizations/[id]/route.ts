import { NextResponse } from 'next/server';
import { OrganizationService } from 'shared/client';
import { clickhouseClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }
  try {
    const { id } = params;
    const service = new OrganizationService(clickhouseClient);
    const responseData = await service.getById(id);

    if (!responseData.data || responseData.data.length === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: responseData.data,
      meta: responseData.meta,
      connections: responseData.connections,
      sanctions: responseData.sanctions
    });
  } catch (error) {
    console.error("Organization API Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
