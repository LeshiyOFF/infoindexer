import { NextResponse } from 'next/server';
import { redisPub } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const { year } = await request.json();
    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }
    
    await redisPub.publish('sync:start', JSON.stringify({ year }));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
